# Day Builder - User Flow & Implementation Documentation

## Current Implementation Status (Phase 1 - Completed)

### What Works Now

- ✅ "New Plan for Today" button creates a plan in the database
- ✅ Newly created plans are auto-selected
- ✅ Plan cards appear in sidebar
- ✅ PlanBuilder loads on the right side
- ✅ Date picker shows currently selected date
- ✅ Duplicate plan detection (currently prevents creating multiple plans for same date)

### Phase 1 Implementation Summary

**Files Modified:**

- `src/components/day-plans/PlansList.tsx`
    - Added `createDayPlan` mutation
    - Implemented `handleCreateToday` to create and auto-select plans
    - Added duplicate detection and user feedback
- `src/app/(main)/day-builder/page.tsx`
    - Passes `selectedDate` to PlansList
- `src/components/day-plans/DatePickerDialog.tsx`
    - Shows currently selected date when opened

---

## Phase 2 - Multiple Plans & Plan Lifecycle (To Implement)

### User Flow Requirements

#### 1. Multiple Plans Per Date

**Current Issue:** Backend enforces one plan per user per date (see `convex/dayPlans.ts:79-89`)

**Desired Behavior:**

- Users can create multiple draft plans for the same date to experiment with different schedules
- "New Plan for Today" button ALWAYS creates a new plan, even if plans already exist for that date
- Each plan maintains its own status: `draft`, `active`, `completed`, `expired`

#### 2. Plan Status Lifecycle

```
draft → active → completed
  ↓       ↓
expired  expired
```

**Status Definitions:**

- **draft**: Plan is being built, not yet active
- **active**: The plan currently displayed on dashboard for that date
- **completed**: User has finished the plan for the day
- **expired**: Date has passed without completion

#### 3. Finalized Plan Editing

**Current Behavior:** After clicking "Finalize Plan", the plan status changes to `completed`

**New Behavior:**

- After finalization, clicking on the plan again shows "Update Plan" instead of "Finalize Plan"
- Users can modify completed plans (adds versioning/audit trail)
- Button text changes based on plan status:
    - `draft` → "Finalize Plan"
    - `active` → "Update Plan"
    - `completed` → "Update Plan"

---

## Dashboard Plan Selection - Proposals

### Problem Statement

When multiple plans exist for the same date, the dashboard needs to know which plan to display. We need a mechanism to
mark a plan as "active" for dashboard display.

### Proposal 1: Explicit Activation Button (Recommended)

**Implementation:**

- Add an "Activate" button/action on each plan card in the sidebar
- Only one plan per date can be "active"
- When activating a plan, system automatically deactivates other plans for that date
- Active plan is visually distinguished (e.g., green border, star icon)
- Dashboard displays the "active" plan for each date

**Pros:**

- Clear and explicit - user knows which plan is active
- Easy to switch between different plan versions
- No ambiguity about which plan shows on dashboard

**Cons:**

- Adds one more step to the workflow
- Slightly more complex UI

**UI Changes:**

```
Plan Card Layout:
┌─────────────────────────────┐
│ 📅 Jan 7, 2026             │
│ ⭐ Active                   │  ← Visual indicator
│ 🕐 6h 30m / 8h 0m          │
│ ⚡ Normal Energy            │
│                             │
│ [Edit] [Duplicate]          │
│ [Activate] [Delete]         │  ← New button (hidden if already active)
└─────────────────────────────┘
```

### Proposal 2: Auto-Activation on Finalize

**Implementation:**

- When user clicks "Finalize Plan", the plan automatically becomes "active"
- Previous active plan (if any) becomes "draft" or "archived"
- Most recently finalized plan is the active one
- Dashboard displays the active plan

**Pros:**

- Simpler workflow - no extra button
- Natural flow: finalize = activate
- Less UI complexity

**Cons:**

- Cannot finalize multiple plans and choose between them
- Less flexibility if user wants to finalize but not activate yet

### Proposal 3: Last Edited / Most Recent

**Implementation:**

- Dashboard automatically shows the most recently modified plan
- No explicit "active" status needed
- Plans ordered by `_creationTime` or `lastModified`

**Pros:**

- Simplest implementation
- No extra UI elements
- Intuitive for single-plan workflow

**Cons:**

- Ambiguous when multiple plans exist
- Accidental edits could change displayed plan
- No user control over which plan shows

### Recommended Approach: Hybrid (Proposal 1 + 2)

**Combined Solution:**

1. Add "active" status to plan schema
2. "Finalize Plan" button automatically activates the plan
3. Add explicit "Activate" button for draft plans
4. Show "Active" badge on active plan cards
5. Dashboard displays active plan for each date

**Workflow:**

```
1. Create draft plan → status: draft
2. Build plan (add chunks, adjust settings)
3. Click "Finalize Plan" → status: active (automatically)
4. Dashboard now shows this plan
5. User can edit: "Update Plan" button
6. User can create alternative draft plan for same date
7. Can activate different plan if desired
```

---

## Implementation Plan - Phase 2

### Backend Changes Required

#### 1. Update Schema (`convex/schema.ts`)

```typescript
dayPlans: defineTable({
  // ... existing fields
  status: v.union(
    v.literal("draft"),
    v.literal("active"),      // ← ADD THIS
    v.literal("completed"),   // ← RENAME from current "completed"
    v.literal("expired")
  ),
  version: v.optional(v.number()),  // ← ADD for versioning
})
```

#### 2. Update `convex/dayPlans.ts`

**Remove duplicate date validation:**

```typescript
// REMOVE lines 79-89 (duplicate check in create mutation)
// Allow multiple plans per date
```

**Add new mutation: `activate`**

```typescript
export const activate = mutation({
  args: { dayPlanId: v.id("dayPlans") },
  handler: async (ctx, args) => {
    // Get the plan to activate
    const plan = await ctx.db.get(args.dayPlanId);

    // Deactivate other plans for the same date
    const sameDatePlans = await ctx.db
      .query("dayPlans")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", plan.userId).eq("date", plan.date)
      )
      .collect();

    for (const p of sameDatePlans) {
      if (p._id !== args.dayPlanId && p.status === "active") {
        await ctx.db.patch(p._id, { status: "draft" });
      }
    }

    // Activate this plan
    await ctx.db.patch(args.dayPlanId, { status: "active" });
    return args.dayPlanId;
  },
});
```

**Update `finalize` mutation:**

```typescript
export const finalize = mutation({
  args: { dayPlanId: v.id("dayPlans") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const plan = await ctx.db.get(args.dayPlanId);
    if (!plan) throw new Error("Plan not found");

    // Deactivate other plans for same date
    const sameDatePlans = await ctx.db
      .query("dayPlans")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", plan.date)
      )
      .collect();

    for (const p of sameDatePlans) {
      if (p._id !== args.dayPlanId && p.status === "active") {
        await ctx.db.patch(p._id, { status: "draft" });
      }
    }

    // Finalize = set to active
    await ctx.db.patch(args.dayPlanId, {
      status: "active",
      version: (plan.version || 0) + 1
    });

    return args.dayPlanId;
  },
});
```

**Add `getActivePlanByDate` query for dashboard:**

```typescript
export const getActivePlanByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const plan = await ctx.db
      .query("dayPlans")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!plan) return null;

    // ... load items, chunks, etc. (same as existing get query)
    return plan;
  },
});
```

### Frontend Changes Required

#### 1. Update `PlansList.tsx`

**Remove duplicate check:**

```typescript
const handleCreateToday = async () => {
  try {
    // REMOVE the existing plan check - always create new plan

    // Create a new plan in the database
    const newPlanId = await createDayPlan({
      date: today,
      timeBudget: 480,
      energyMode: "normal",
    });

    onSelectPlan(newPlanId);

    toast.success("New plan created", {
      description: "Draft plan created for today",
    });
  } catch (error) {
    console.error("Failed to create plan:", error);
    toast.error("Failed to create plan", {
      description: "Please try again",
    });
  }
};
```

**Update button text:**

```typescript
<Button onClick = { handleCreateToday }
className = "w-full" >
<Plus className = "mr-2 h-4 w-4" / >
  Create
New
Plan
< /Button>
```

#### 2. Update `PlanCard.tsx`

**Add activate button and active indicator:**

```typescript
// Add activate mutation
const activatePlan = useMutation(api.dayPlans.activate);

// Add activate handler
const handleActivate = async () => {
  try {
    await activatePlan({ dayPlanId: plan._id });
    toast.success("Plan activated", {
      description: "This plan is now active on your dashboard",
    });
  } catch (error) {
    toast.error("Failed to activate plan");
  }
};

// In the render:
{
  plan.status === "active" && (
    <Badge variant = "default"
  className = "mb-2" >
    ⭐ Active
< /Badge>
)
}

{
  plan.status === "draft" && (
    <Button onClick = { handleActivate }
  size = "sm"
  variant = "outline" >
    Activate
    < /Button>
)
}
```

#### 3. Update `DayPlanBuilder.tsx`

**Change button text based on status:**

```typescript
const finalizeButtonText = () => {
  if (!existingPlan) return "Finalize Plan";

  switch (existingPlan.status) {
    case "draft":
      return "Finalize Plan";
    case "active":
    case "completed":
      return "Update Plan";
    default:
      return "Finalize Plan";
  }
};

// In render:
<Button onClick = { handleFinalizePlan } >
<CheckCircle2 className = "mr-2 h-4 w-4" / >
  { finalizeButtonText() }
  < /Button>
```

#### 4. Update Dashboard to use `getActivePlanByDate`

**File:** `src/app/(main)/dashboard/page.tsx` (or wherever dashboard shows plans)

```typescript
// Use the new query
const todayPlan = useQuery(api.dayPlans.getActivePlanByDate, {
  date: todayDate,
});

// This will only return the active plan for the date
```

---

## Testing Scenarios - Phase 2

### Scenario 1: Create Multiple Plans

1. Go to Day Builder
2. Click "Create New Plan"
3. Build a plan (Plan A - draft)
4. Click "Create New Plan" again
5. Build another plan (Plan B - draft)
6. Verify both plans show in sidebar

### Scenario 2: Finalize Plan (Auto-activate)

1. Create Plan A (draft)
2. Click "Finalize Plan"
3. Verify Plan A status changes to "active"
4. Verify Plan A shows "⭐ Active" badge
5. Check dashboard - verify Plan A is displayed

### Scenario 3: Activate Different Plan

1. Create Plan A and finalize (active)
2. Create Plan B (draft)
3. Click "Activate" on Plan B
4. Verify Plan B becomes active
5. Verify Plan A becomes draft
6. Check dashboard - verify Plan B is displayed

### Scenario 4: Update Active Plan

1. Create and finalize Plan A (active)
2. Click on Plan A in sidebar
3. Verify button shows "Update Plan" instead of "Finalize Plan"
4. Add/remove chunks
5. Click "Update Plan"
6. Verify changes are saved
7. Verify plan remains active

### Scenario 5: Multiple Plans Same Date

1. Create 3 plans for Jan 7, 2026
2. Finalize one (becomes active)
3. Verify only one has "Active" badge
4. Verify dashboard shows the active one
5. Switch active plan
6. Verify dashboard updates

---

## Files Summary

### Modified in Phase 1 (Completed):

- `src/components/day-plans/PlansList.tsx`
- `src/app/(main)/day-builder/page.tsx`
- `src/components/day-plans/DatePickerDialog.tsx`

### To Modify in Phase 2:

- `convex/schema.ts` - Add "active" status
- `convex/dayPlans.ts` - Remove duplicate check, add activate mutation, update finalize
- `src/components/day-plans/PlansList.tsx` - Remove duplicate check
- `src/components/day-plans/PlanCard.tsx` - Add activate button and badge
- `src/components/day-plans/DayPlanBuilder.tsx` - Change button text based on status
- `src/app/(main)/dashboard/page.tsx` - Use getActivePlanByDate query

---

## Migration Notes

When deploying Phase 2:

1. Existing plans with `status: "completed"` should be migrated to `status: "active"`
2. Run migration to add `version: 1` to existing plans
3. Ensure only one plan per date is marked as "active" during migration
