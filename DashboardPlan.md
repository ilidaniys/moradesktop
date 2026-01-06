# Dashboard Plan - Day Plan Execution Interface

## Overview
The Dashboard is the primary execution interface where users review and work through their finalized day plans. It provides real-time status tracking, progress monitoring, and task execution controls.

## Current State Analysis

### Existing Infrastructure
- **Schema**: Day plans and items already support status tracking
  - `dayPlans.status`: `draft` → `active` → `completed`
  - `dayPlanItems.status`: `pending` | `completed` | `skipped` | `moved`
  - Already has `finalize` mutation to activate plans
  - Already has `updateItemStatus` mutation for item tracking

- **Day Builder**:
  - Creates draft plans
  - Allows adding/removing/reordering chunks
  - AI-powered plan generation
  - Finalize button changes plan status to `active`

### Gap Analysis
1. **No Dashboard interface** to view and execute active plans
2. **Missing "in progress" status** for items currently being worked on
3. **No timer/tracking UI** for time management during execution
4. **No navigation entry** for Dashboard
5. **No queries** to fetch today's active plan efficiently

---

## Requirements

### Functional Requirements
1. **Display Today's Plan**
   - Fetch and display active plan for current date
   - Show all plan items in order
   - Display plan metadata (time budget, energy mode)

2. **Item Status Management**
   - Mark item as "in progress" (currently working on)
   - Mark item as "completed" (with optional actual duration)
   - Skip item (mark as "skipped")
   - Pause work (return to "pending")
   - Only one item can be "in progress" at a time

3. **Progress Tracking**
   - Visual progress indicator (completed/total items)
   - Time tracking (planned vs. actual)
   - Energy budget monitoring

4. **Plan Completion**
   - Mark entire plan as completed
   - Trigger end-of-day review flow

### Non-Functional Requirements
- Real-time updates using Convex reactivity
- Smooth animations for status transitions
- Mobile-responsive design
- Keyboard shortcuts for quick actions

---

## Technical Design

### Schema Changes

**Update `dayPlanItems` status enum:**
```typescript
status: v.union(
  v.literal("pending"),      // Not started
  v.literal("inProgress"),   // Currently working on (NEW)
  v.literal("completed"),    // Finished
  v.literal("skipped"),      // Skipped for today
  v.literal("moved"),        // Moved to another day
)
```

**Add fields to `dayPlanItems`:**
```typescript
startedAt: v.optional(v.number()),    // When item was started
completedAt: v.optional(v.number()),  // When item was completed
```

### Backend (Convex)

**New Queries:**
1. `dayPlans.getActiveForToday()` - Fetch today's active plan
2. `dayPlans.getActiveDayPlanStats()` - Get statistics for active plan

**New Mutations:**
1. `dayPlans.startItem(itemId)` - Mark item as in progress
   - Set other items to pending/completed/skipped (only one active)
   - Record startedAt timestamp
   - Update chunk status to "inProgress"

2. `dayPlans.pauseItem(itemId)` - Pause current item
   - Set status back to "pending"
   - Update chunk status back to "inPlan"

3. `dayPlans.completeItem(itemId, actualDurationMin)` - Complete item
   - Set status to "completed"
   - Record completedAt timestamp
   - Save actual duration
   - Update chunk status to "done"

**Enhanced Mutations:**
- Update existing `updateItemStatus` to handle new "inProgress" status
- Ensure only one item can be "inProgress" at a time

### Frontend Architecture

#### Route Structure
```
/dashboard (NEW)
  - src/app/(main)/dashboard/page.tsx
```

#### Component Hierarchy
```
DashboardPage
├── NoPlanState (if no active plan)
│   └── Link to Day Builder
├── DashboardView (if active plan exists)
    ├── DashboardHeader
    │   ├── Date display
    │   ├── Plan metadata (time budget, energy mode)
    │   └── Complete Plan button
    ├── PlanProgress
    │   ├── Progress bar (completed/total)
    │   ├── Time used indicator
    │   └── Time remaining indicator
    ├── ActiveItemCard (current in-progress item, if any)
    │   ├── Timer display
    │   ├── Chunk details
    │   ├── Complete button
    │   └── Pause button
    └── PlanItemsList
        └── DashboardPlanItem (for each item)
            ├── Status indicator
            ├── Chunk details (title, DoD, duration, tags)
            ├── Action buttons (Start/Complete/Skip)
            └── Actual duration input (if completed)
```

#### Key Components

**1. DashboardPage** (`src/app/(main)/dashboard/page.tsx`)
- Main page component
- Fetches today's active plan
- Handles loading and error states
- Shows NoPlanState or DashboardView

**2. DashboardView** (`src/components/dashboard/DashboardView.tsx`)
- Main dashboard container
- Manages plan execution state
- Coordinates all child components

**3. DashboardHeader** (`src/components/dashboard/DashboardHeader.tsx`)
- Displays date, plan metadata
- Complete Plan button
- Quick stats display

**4. PlanProgress** (`src/components/dashboard/PlanProgress.tsx`)
- Progress bar with percentage
- Completed items count
- Time tracking (used/remaining)
- Energy budget indicator

**5. ActiveItemCard** (`src/components/dashboard/ActiveItemCard.tsx`)
- Prominent card for in-progress item
- Timer display (counts up from start)
- Complete and Pause buttons
- Chunk details and DoD

**6. PlanItemsList** (`src/components/dashboard/PlanItemsList.tsx`)
- List container for all plan items
- Sorted by order
- Groups items by status (pending, completed, skipped)

**7. DashboardPlanItem** (`src/components/dashboard/DashboardPlanItem.tsx`)
- Individual item display
- Status badge (pending/in-progress/completed/skipped)
- Chunk details (title, DoD, duration, tags, area)
- Action buttons based on status:
  - **Pending**: Start button
  - **In Progress**: Complete, Pause buttons
  - **Completed**: Actual duration display, Re-open button
  - **Skipped**: Un-skip button

**8. NoPlanState** (`src/components/dashboard/NoPlanState.tsx`)
- Empty state when no active plan
- Link to Day Builder
- Helpful message

#### Custom Hooks

**1. `useActiveDayPlan`** (`src/hooks/useActiveDayPlan.ts`)
- Fetches today's active day plan
- Returns plan data, loading, error states
- Computed values (progress, time stats)

**2. `usePlanItemActions`** (`src/hooks/usePlanItemActions.ts`)
- Wraps all item action mutations
- Provides: startItem, pauseItem, completeItem, skipItem
- Handles loading states and errors

---

## Implementation Phases

### Phase 1: Backend Foundation
**Goal**: Set up data layer and mutations

1. **Update Schema**
   - Add "inProgress" status to dayPlanItems
   - Add startedAt, completedAt fields to dayPlanItems
   - Run migration if needed

2. **Create Queries**
   - `getActiveForToday`: Fetch today's active plan with all items
   - `getActiveDayPlanStats`: Calculate completion stats

3. **Create Mutations**
   - `startItem`: Mark item as in progress
   - `pauseItem`: Pause current item
   - `completeItem`: Complete item with actual duration
   - Ensure single active item constraint

4. **Update Existing Mutations**
   - Modify `updateItemStatus` to handle "inProgress"
   - Ensure chunk status sync is correct

**Files to modify:**
- `convex/schema.ts` - Update dayPlanItems definition
- `convex/dayPlans.ts` - Add new queries and mutations

### Phase 2: Core Dashboard UI
**Goal**: Build main dashboard interface

1. **Create Dashboard Route**
   - Create `/dashboard` page
   - Set up data fetching

2. **Build Core Components**
   - DashboardPage (page container)
   - DashboardView (main view)
   - DashboardHeader (header with metadata)
   - NoPlanState (empty state)

3. **Update Navigation**
   - Add Dashboard to Sidebar (first item)
   - Use appropriate icon (CheckSquare or Calendar)

**Files to create:**
- `src/app/(main)/dashboard/page.tsx`
- `src/components/dashboard/DashboardView.tsx`
- `src/components/dashboard/DashboardHeader.tsx`
- `src/components/dashboard/NoPlanState.tsx`

**Files to modify:**
- `src/components/layout/Sidebar.tsx` - Add Dashboard navigation

### Phase 3: Item Management
**Goal**: Build item interaction components

1. **Create Item Components**
   - ActiveItemCard (highlighted current item)
   - PlanItemsList (list container)
   - DashboardPlanItem (individual item)

2. **Create Custom Hooks**
   - `useActiveDayPlan` (fetch today's plan)
   - `usePlanItemActions` (action mutations)

3. **Implement Status Actions**
   - Start button → sets item to "inProgress"
   - Pause button → sets item to "pending"
   - Complete button → sets item to "completed"
   - Skip button → sets item to "skipped"
   - Single active item enforcement

**Files to create:**
- `src/components/dashboard/ActiveItemCard.tsx`
- `src/components/dashboard/PlanItemsList.tsx`
- `src/components/dashboard/DashboardPlanItem.tsx`
- `src/hooks/useActiveDayPlan.ts`
- `src/hooks/usePlanItemActions.ts`

### Phase 4: Progress Tracking
**Goal**: Add progress indicators and time tracking

1. **Create Progress Component**
   - PlanProgress with progress bar
   - Completed/total items count
   - Time used/remaining display

2. **Add Timer to ActiveItemCard**
   - Real-time timer counting from startedAt
   - Format: "25:30" (minutes:seconds)
   - Pause and resume support

3. **Add Actual Duration Input**
   - Input field for completed items
   - Auto-populate with planned duration
   - Optional manual adjustment

**Files to create:**
- `src/components/dashboard/PlanProgress.tsx`

**Files to modify:**
- `src/components/dashboard/ActiveItemCard.tsx` - Add timer
- `src/components/dashboard/DashboardPlanItem.tsx` - Add duration input

### Phase 5: Plan Completion
**Goal**: Handle end of day flow

1. **Complete Plan Flow**
   - Complete Plan button in header
   - Confirmation dialog
   - Trigger dayPlans.complete mutation
   - Navigate to review screen (future)

2. **Plan Review Integration**
   - Link to end-of-day review (Phase 4 of main plan)
   - Show completion stats

3. **Edge Cases**
   - Handle incomplete items
   - Allow completing plan with skipped items
   - Warn about pending items

**Files to modify:**
- `src/components/dashboard/DashboardHeader.tsx` - Add complete button
- Create completion dialog component

### Phase 6: Polish & UX
**Goal**: Enhance user experience

1. **Keyboard Shortcuts**
   - `s` - Start next item
   - `c` - Complete current item
   - `p` - Pause current item
   - `x` - Skip current item

2. **Animations**
   - Smooth status transitions
   - Progress bar animations
   - Item reordering animations

3. **Mobile Optimization**
   - Responsive layout
   - Touch-friendly buttons
   - Swipe gestures (optional)

4. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

---

## Data Flow

### Starting an Item
```
User clicks "Start" on item
  ↓
usePlanItemActions.startItem(itemId)
  ↓
Mutation: dayPlans.startItem(itemId)
  ↓
1. Find any other "inProgress" items → set to "pending"
2. Update item: status="inProgress", startedAt=now
3. Update chunk: status="inProgress"
  ↓
Convex reactive query updates
  ↓
Dashboard re-renders with updated state
  ↓
ActiveItemCard displays the new active item with timer
```

### Completing an Item
```
User clicks "Complete" on item (with actual duration)
  ↓
usePlanItemActions.completeItem(itemId, actualDurationMin)
  ↓
Mutation: dayPlans.completeItem(itemId, actualDurationMin)
  ↓
1. Update item: status="completed", completedAt=now, actualDurationMin
2. Update chunk: status="done", completedAt=now
3. Update area: lastTouchedAt=now
  ↓
Convex reactive query updates
  ↓
Dashboard re-renders
  ↓
Progress bar updates, item moves to completed section
```

### Completing Entire Plan
```
User clicks "Complete Plan"
  ↓
Confirmation dialog
  ↓
User confirms
  ↓
Mutation: dayPlans.complete(dayPlanId, perceivedLoad, notes)
  ↓
1. Update plan: status="completed", completedAt=now
2. Create dayReview record
  ↓
Navigate to review screen or show success message
```

---

## UI/UX Design Specifications

### Dashboard Header
- **Date Display**: Large, prominent (e.g., "Monday, January 5, 2026")
- **Plan Metadata**: Small badges for time budget (480m) and energy mode (normal)
- **Complete Plan Button**: Primary button, right-aligned
- **Background**: Subtle gradient or border at bottom

### Progress Section
- **Progress Bar**: Full-width, colored (green for completed percentage)
- **Stats Row**: 3 columns
  - Completed Items: "3/5 tasks completed"
  - Time Used: "185 / 480 minutes used"
  - Remaining: "295 minutes remaining"
- **Color Coding**:
  - Green: on track
  - Yellow: approaching limit
  - Red: over time

### Active Item Card
- **Prominence**: Larger card with border/shadow
- **Layout**:
  - Top: Timer (large font, center-aligned)
  - Middle: Chunk details (title, DoD)
  - Bottom: Action buttons (Complete, Pause)
- **Timer Format**: "25:30" (MM:SS), counts up from start
- **Color**: Accent color to draw attention

### Plan Items List
- **Grouping**: Optional grouping by status
  - In Progress (if not in ActiveItemCard)
  - Pending
  - Completed (collapsed by default)
  - Skipped (collapsed by default)
- **Item Layout**:
  - Left: Status badge
  - Center: Chunk details
  - Right: Action buttons
- **Status Colors**:
  - Pending: Gray
  - In Progress: Blue
  - Completed: Green
  - Skipped: Orange

### Empty State
- **Icon**: Calendar or CheckSquare
- **Message**: "No active plan for today"
- **Action**: "Go to Day Builder" button
- **Style**: Centered, friendly, helpful

---

## Error Handling

### Scenarios
1. **No Active Plan**: Show NoPlanState with link to Day Builder
2. **Network Error**: Show error toast, retry button
3. **Mutation Failure**: Show error toast, revert optimistic update
4. **Concurrent Edit**: Handle conflicts (last write wins)
5. **Multiple In Progress**: Backend enforces single active item

### User Feedback
- **Success**: Toast notification on item complete
- **Error**: Toast with error message and retry option
- **Loading**: Skeleton loaders for initial load, spinners for mutations

---

## Testing Strategy

### Unit Tests
- Component rendering tests
- Hook logic tests
- Mutation validation tests

### Integration Tests
- Complete item flow (pending → in progress → completed)
- Single active item constraint
- Time tracking calculations
- Plan completion flow

### E2E Tests
1. User finalizes plan in Day Builder
2. User navigates to Dashboard
3. User starts first item
4. Timer begins counting
5. User completes item with actual duration
6. Progress updates
7. User starts next item
8. User completes entire plan

---

## Future Enhancements

### Phase 2 Improvements
1. **Pomodoro Timer**: Built-in timer with break reminders
2. **Notifications**: Browser notifications for breaks, overruns
3. **Drag & Drop**: Reorder items during the day
4. **Quick Add**: Add new items to active plan
5. **Split Chunk**: Split oversized chunks during execution
6. **Notes**: Add quick notes to completed items
7. **Time Tracking**: Automatic time tracking with pause/resume

### Analytics Integration
- Daily completion rate
- Time estimation accuracy
- Energy mode effectiveness
- Area balance over time

### Mobile App
- Native mobile app for dashboard
- Background timers
- Push notifications
- Offline support

---

## Success Metrics

### Key Performance Indicators
1. **Plan Completion Rate**: % of finalized plans that are completed
2. **Item Completion Rate**: % of items marked completed vs. skipped
3. **Time Accuracy**: Avg difference between planned and actual duration
4. **Daily Engagement**: % of days with active plan usage
5. **Time to Complete Plan**: Avg time from finalize to complete

### User Experience Metrics
1. **Dashboard Load Time**: < 500ms
2. **Mutation Response Time**: < 200ms
3. **Error Rate**: < 1% of mutations fail
4. **Mobile Usage**: Dashboard works on mobile devices

---

## Implementation Checklist

### Backend
- [ ] Update schema with "inProgress" status
- [ ] Add startedAt, completedAt fields
- [ ] Create getActiveForToday query
- [ ] Create getActiveDayPlanStats query
- [ ] Create startItem mutation
- [ ] Create pauseItem mutation
- [ ] Create completeItem mutation
- [ ] Update updateItemStatus mutation
- [ ] Add single active item constraint
- [ ] Test all mutations

### Frontend - Core
- [ ] Create /dashboard route
- [ ] Create DashboardPage component
- [ ] Create DashboardView component
- [ ] Create DashboardHeader component
- [ ] Create NoPlanState component
- [ ] Add Dashboard to navigation
- [ ] Create useActiveDayPlan hook
- [ ] Create usePlanItemActions hook

### Frontend - Item Management
- [ ] Create ActiveItemCard component
- [ ] Create PlanItemsList component
- [ ] Create DashboardPlanItem component
- [ ] Implement Start action
- [ ] Implement Pause action
- [ ] Implement Complete action
- [ ] Implement Skip action
- [ ] Add actual duration input

### Frontend - Progress
- [ ] Create PlanProgress component
- [ ] Add progress bar
- [ ] Add time tracking display
- [ ] Add timer to ActiveItemCard
- [ ] Format timer display
- [ ] Test progress calculations

### Frontend - Completion
- [ ] Add Complete Plan button
- [ ] Create completion confirmation dialog
- [ ] Wire up complete mutation
- [ ] Handle post-completion navigation
- [ ] Test completion flow

### Polish
- [ ] Add keyboard shortcuts
- [ ] Add animations
- [ ] Mobile responsive design
- [ ] Accessibility audit
- [ ] Error handling
- [ ] Loading states
- [ ] Success feedback

### Testing
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Write E2E tests
- [ ] Manual testing on mobile
- [ ] Performance testing

---

## File Structure

```
convex/
├── schema.ts (UPDATE)
├── dayPlans.ts (UPDATE - add queries/mutations)

src/
├── app/(main)/
│   └── dashboard/
│       └── page.tsx (NEW)
├── components/
│   ├── dashboard/ (NEW)
│   │   ├── ActiveItemCard.tsx
│   │   ├── DashboardHeader.tsx
│   │   ├── DashboardPlanItem.tsx
│   │   ├── DashboardView.tsx
│   │   ├── NoPlanState.tsx
│   │   ├── PlanItemsList.tsx
│   │   └── PlanProgress.tsx
│   └── layout/
│       └── Sidebar.tsx (UPDATE - add Dashboard nav)
└── hooks/
    ├── useActiveDayPlan.ts (NEW)
    └── usePlanItemActions.ts (NEW)
```

---

## Estimated Effort

- **Phase 1**: Backend Foundation - 4 hours
- **Phase 2**: Core Dashboard UI - 4 hours
- **Phase 3**: Item Management - 6 hours
- **Phase 4**: Progress Tracking - 4 hours
- **Phase 5**: Plan Completion - 2 hours
- **Phase 6**: Polish & UX - 4 hours

**Total Estimated Time**: 24 hours

---

## Notes

- The Dashboard becomes the **primary interface** for daily execution
- Day Builder is for **planning**, Dashboard is for **doing**
- Keep the interface **simple and focused** - minimize distractions
- **Real-time updates** are crucial for smooth UX
- **Single active item** constraint prevents multi-tasking
- Consider adding **gamification** elements (streaks, badges) later
- Plan for **offline support** in future mobile app
