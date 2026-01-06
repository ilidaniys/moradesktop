# Dashboard Multiple Plans - Design Variants

## Context

Currently, the dashboard shows only today's active plan with real-time execution tracking (start/pause/complete tasks,
timer, progress). As we add support for multiple day plans with different dates, we need to decide how the dashboard
should handle this.

## Current Dashboard Features

- Shows today's active plan only
- Real-time execution tracking (timer, start/pause/complete)
- Progress indicators (completion %, time used vs budget)
- Active item card with timer
- Pending/completed/skipped task lists
- "Complete Plan" button for end-of-day review

## Evaluation Criteria

- **Focus**: Does it maintain focus on today's execution?
- **Awareness**: Can users see upcoming/other plans?
- **Complexity**: How complex is the implementation?
- **Mobile**: Does it work well on mobile devices?
- **Disruption**: How much does it change current behavior?

---

## Variant 1: Single Active Plan (Minimal Change)

### Description

Keep the current behavior exactly as-is, with a small addition:

- Dashboard always shows today's active plan
- Add a "View All Plans" button in the header
- Clicking opens a modal/drawer showing list of all plans (past/future)
- Clicking a plan in the modal navigates to Day Builder with that plan selected

### UI Mockup

```
┌────────────────────────────────────────┐
│  Dashboard - Jan 6, 2026  [View Plans] │
├────────────────────────────────────────┤
│                                        │
│  [Current Active Plan View]            │
│  - Progress indicators                 │
│  - Active item with timer              │
│  - Task lists                          │
│                                        │
└────────────────────────────────────────┘

Click "View Plans" opens modal:
┌────────────────────────────────────────┐
│  All Plans                        [×]  │
├────────────────────────────────────────┤
│  ┌────────────────────────────────┐   │
│  │ Jan 7, 2026          [Draft]   │   │
│  │ 3 tasks • 180 min              │   │
│  └────────────────────────────────┘   │
│  ┌────────────────────────────────┐   │
│  │ Jan 8, 2026          [Draft]   │   │
│  │ 5 tasks • 240 min              │   │
│  └────────────────────────────────┘   │
└────────────────────────────────────────┘
```

### Pros

✅ Zero disruption to current dashboard experience
✅ Maintains strong focus on today's execution
✅ Simple implementation - just add button + modal
✅ Works great on mobile (modal pattern)
✅ Clear separation: dashboard = execution, day builder = planning

### Cons

❌ No visibility into other plans without clicking
❌ Requires extra click to see upcoming plans
❌ Modal may feel disconnected from main flow

### Implementation Complexity

**Low** - Add one button, create modal component with plan list

### Recommendation

**Best for:** Users who want zero distractions during execution. Maintains the current "dashboard is for doing, not
planning" philosophy.

---

## Variant 2: Compact Sidebar with Upcoming Plans

### Description

Add a narrow collapsible sidebar showing upcoming plans:

- Main area shows today's active plan (current behavior)
- Right sidebar (250px) shows next 3-5 upcoming plans
- Each upcoming plan shows: date, status badge, task count
- Clicking a plan navigates to Day Builder
- Sidebar collapsible to full-width when needed
- "View All Plans" link at bottom

### UI Mockup

```
┌──────────────────────────────┬─────────────┐
│ Dashboard - Jan 6, 2026      │  Upcoming   │
├──────────────────────────────┤             │
│                              │ Jan 7       │
│ [Active Plan View]           │ Draft       │
│ - Progress                   │ 3 tasks     │
│ - Active item                │             │
│ - Task lists                 │ Jan 8       │
│                              │ Draft       │
│                              │ 5 tasks     │
│                              │             │
│                              │ Jan 9       │
│                              │ Active      │
│                              │ 4 tasks     │
│                              │             │
│                              │ View All    │
└──────────────────────────────┴─────────────┘
```

### Pros

✅ Awareness of upcoming plans without leaving dashboard
✅ Maintains focus on today (main area unchanged)
✅ Quick navigation to other plans
✅ Collapsible for more space when needed
✅ Shows status at a glance (draft vs ready)

### Cons

❌ Takes up screen space (may feel cramped)
❌ Limited info shown per plan (only basic stats)
❌ On mobile, would need to be collapsible/hidden by default
❌ May encourage context-switching during execution

### Implementation Complexity

**Medium** - Create sidebar component, make layout responsive, add collapse toggle

### Recommendation

**Best for:** Users who plan multiple days ahead and want quick visibility into their schedule without leaving execution
mode.

---

## Variant 3: Date Selector Dropdown

### Description

Add a date selector dropdown in the dashboard header:

- Dashboard UI remains the same
- Add dropdown in header to select any date
- Dropdown shows: Today | Tomorrow | Select Date...
- Selecting a date loads that day's plan into the dashboard
- All execution features work for any selected date
- "Today" is default and prominently displayed

### UI Mockup

```
┌────────────────────────────────────────────┐
│  Dashboard    [Jan 6, 2026 ▼]              │
│                └── Today                   │
│                    Tomorrow                │
│                    Jan 8, 2026             │
│                    Select Date...          │
├────────────────────────────────────────────┤
│                                            │
│  [Plan View for Selected Date]             │
│  - Progress indicators                     │
│  - Active item (if in progress)            │
│  - Task lists                              │
│  - Complete Plan button                    │
│                                            │
└────────────────────────────────────────────┘
```

### Pros

✅ Flexible - can view/execute any plan from dashboard
✅ Minimal UI change (just dropdown)
✅ Could review yesterday's plan or prep tomorrow
✅ Good for users who work on multiple days' plans
✅ Simple interaction pattern users understand

### Cons

❌ Breaks "dashboard = today's execution" mental model
❌ Users might accidentally switch away from today
❌ May confuse users about which day they're working on
❌ Need prominent indicator of selected date
❌ Executing tomorrow's tasks today could create confusion

### Implementation Complexity

**Medium** - Modify dashboard to accept date parameter, add dropdown, handle date selection

### Recommendation

**Best for:** Users who need flexibility to review past plans or work ahead on future plans. Requires clear UI to
prevent confusion about "what day am I on?"

---

## Variant 4: Timeline/Agenda View (Alternative Dashboard)

### Description

Completely reimagine the dashboard as a multi-day timeline:

- Vertical timeline showing 5-7 days (yesterday → +5 days)
- Each day is a collapsible section
- Today's section expanded by default with full execution UI
- Other days show collapsed summary cards
- Click to expand other days for preview (no execution)
- "Focus on Today" button to collapse all except today

### UI Mockup

```
┌────────────────────────────────────────┐
│  Dashboard                             │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐ │
│  │ Jan 5 (Yesterday) [Completed] ▼  │ │
│  │ 5/6 tasks • 240/300 min          │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Jan 6 (Today) [Active] ▼         │ │
│  ├──────────────────────────────────┤ │
│  │ [Full Execution Interface]       │ │
│  │ - Progress bars                  │ │
│  │ - Active item with timer         │ │
│  │ - Task lists                     │ │
│  │ - Start/Pause/Complete           │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Jan 7 (Tomorrow) [Draft] ▶       │ │
│  │ 3 tasks • 180 min                │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Jan 8 (Wed) [Draft] ▶            │ │
│  │ 5 tasks • 240 min                │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

### Pros

✅ Great overview of past and future plans
✅ Natural chronological flow
✅ Can quickly review what was done yesterday
✅ See upcoming work without leaving dashboard
✅ Today still gets prominent full UI

### Cons

❌ Significantly more complex implementation
❌ Requires lots of scrolling
❌ May feel overwhelming with information
❌ Difficult on mobile (too much vertical space)
❌ Breaks existing dashboard completely

### Implementation Complexity

**High** - Complete dashboard redesign, collapsible sections, timeline logic, responsive challenges

### Recommendation

**Best for:** Power users who manage multiple days actively and want a "mission control" view. Not recommended for
initial implementation due to complexity and disruption.

---

## Recommendations

### Immediate Implementation (Phase 1)

**Implement Variant 1: Single Active Plan (Minimal Change)**

- Lowest risk, maintains current UX
- Simple to implement
- Provides access to all plans without cluttering dashboard
- Can be done alongside the day-builder plans list feature

### Future Enhancement (Phase 2)

**Consider Variant 2: Compact Sidebar**

- If users request more visibility into upcoming plans
- Can be added as an optional toggle/preference
- Provides better awareness without major disruption
- Good middle ground between focus and awareness

### Not Recommended Initially

**Variant 3: Date Selector Dropdown**

- Risk of confusing users about "what day am I on"
- Breaks mental model of dashboard = today's execution
- Could be considered later if clear user need emerges

**Variant 4: Timeline/Agenda View**

- Too complex for initial implementation
- Requires extensive testing and iteration
- Could be a separate "Week View" page instead
- Better as a long-term experiment, not immediate change

---

## Decision Framework

Ask these questions to decide:

1. **How do users currently use the dashboard?**
    - If primarily for today's execution → Variant 1
    - If they want to peek at tomorrow often → Variant 2

2. **What's the user's planning horizon?**
    - Plan 1-2 days ahead → Variant 1 or 2
    - Plan a full week ahead → Consider Variant 4 (as separate view)

3. **What device do they use most?**
    - Desktop → Any variant works
    - Mobile → Variant 1 or 3 (avoid sidebars)

4. **How much should we change now?**
    - Minimize risk → Variant 1
    - Enhance but don't disrupt → Variant 2
    - Transform completely → Variant 4

## Implementation Notes

Whichever variant is chosen, ensure:

- Clear visual hierarchy (today is most prominent)
- Responsive design (works on mobile)
- Fast loading (don't query unnecessary data)
- Accessibility (keyboard navigation, screen readers)
- User preference/toggle if showing additional plans