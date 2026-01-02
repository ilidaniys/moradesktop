# AI Focus Planner - Development Guidelines

## Product Overview

### What It Is
AI Focus Planner is a desktop-first productivity tool that helps users manage long-term areas of responsibility (Areas), translate them into near-term intentions (Intentions), and extract executable work chunks (Executable Chunks) to build realistic daily plans.

### What It Is NOT
- **NOT** another generic todo list application
- **NOT** an AI that invents tasks for you
- **NOT** a calendar with forced smart scheduling

### Core Value Proposition
Users maintain visibility of long-term commitments without drowning in task lists. The system bridges the gap between "big picture" and "today's actions" daily.

---

## Core Data Model

### 1. Areas (Long-term Domains)

**Definition**: A domain of responsibility or long-running project requiring regular attention.

**Examples**:
- ART Platform
- AI Planner Development
- D&D Campaign Preparation
- Work Projects

**Key Principle**: Areas are always "alive" but don't necessarily contain concrete daily actions.

**Data Structure**:
```typescript
interface Area {
  id: string;
  title: string;
  description: string;
  weight: number; // Priority/importance (1-10)
  status: 'active' | 'paused' | 'archived';
  createdAt: number;
  updatedAt: number;
  lastTouchedAt: number; // Last time any chunk was worked on
  health: 'neglected' | 'normal' | 'urgent'; // Auto-calculated
}
```

**Business Rules**:
- Maximum 5-7 active Areas recommended (enforce in UI with warnings)
- Health auto-calculated based on lastTouchedAt:
  - `neglected`: >14 days
  - `normal`: 3-14 days
  - `urgent`: marked by user or blocking chunks exist

---

### 2. Intentions (Near-term Focus)

**Definition**: A statement of what you want to advance within an Area in the near term.

**Examples**:
- ART → "Improve liquidation indicator"
- Planner → "Build MVP day-builder"
- D&D → "Prepare Temple of Colors in Escanor"
- Work → "Close blocking PRs/tickets"

**Key Principle**: This is NOT a daily task. It's a "direction of effort."

**Data Structure**:
```typescript
interface Intention {
  id: string;
  areaId: string;
  title: string;
  description?: string;
  status: 'active' | 'paused' | 'done';
  order: number; // For manual sorting
  createdAt: number;
  updatedAt: number;
}
```

**Business Rules**:
- Maximum 2-3 active Intentions per Area (HARD LIMIT - enforce in UI)
- Others must be in Backlog/Paused state
- This constraint is critical for focus - show warning when limit reached

---

### 3. Executable Chunks (Work Units)

**Definition**: The smallest clearly executable unit of work that can realistically be completed today.

**Requirements for a valid Chunk**:
- Takes 30-120 minutes
- Has clear Definition of Done
- No "need to think about what to do" - action is clear

**Examples**:
- ART → "Ticket #142: Fix cluster size calculation + test"
- Planner → "Build Areas list screen + CRUD"
- D&D → "Write 1 page of temple lore (entrance, scenes, hooks)"

**Data Structure**:
```typescript
interface Chunk {
  id: string;
  areaId: string;
  intentionId: string;
  title: string;
  dod: string; // Definition of Done
  durationMin: number; // Estimated minutes (30-120)
  status: 'backlog' | 'ready' | 'inPlan' | 'inProgress' | 'done';
  tags: string[]; // ['coding', 'writing', 'admin', 'review', etc.]
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}
```

**Status Flow**:
```
backlog → ready → inPlan → inProgress → done
         ↑         ↓
         └─ (can go back)
```

**Business Rules**:
- Duration MUST be 30-120 minutes (validate on creation/edit)
- DoD MUST be non-empty
- Status "ready" means: can be picked for daily plan without additional thinking
- Maximum 20 chunks per Intention in "ready" status (warn if exceeded)

---

### 4. Day Plans

**Definition**: A finalized plan for a specific day containing selected chunks.

**Data Structure**:
```typescript
interface DayPlan {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  timeBudget: number; // Available minutes for the day
  energyMode: 'deep' | 'normal' | 'light';
  notes?: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: number;
  finalizedAt?: number;
  completedAt?: number;
}

interface DayPlanItem {
  id: string;
  dayPlanId: string;
  chunkId: string;
  order: number;
  locked: boolean; // User-locked, won't be changed by AI
  status: 'pending' | 'completed' | 'skipped' | 'moved';
  aiReason?: string; // Why AI suggested this chunk
  actualDurationMin?: number; // Tracked time
}
```

**Business Rules**:
- Only ONE active DayPlan per date
- Total chunk duration should not exceed timeBudget * 1.2 (20% buffer)
- Locked items cannot be removed by AI re-generation
- Maximum 8 items per day plan (cognitive load limit)

---

## User Flows

### Flow A: Areas Overview Screen

**Purpose**: High-level dashboard of all Areas and their health.

**Display**:
```
┌─────────────────────────────────────────┐
│ Areas Overview                          │
├─────────────────────────────────────────┤
│ [+] New Area                            │
│                                         │
│ ⚡ ART Platform             [Normal]    │
│   • 2 active intentions                 │
│   • 7 chunks ready                      │
│   • Last touched: 2 days ago            │
│   [Extract Chunks]                      │
│                                         │
│ 🎯 AI Planner               [Urgent]    │
│   • 3 active intentions                 │
│   • 12 chunks ready                     │
│   • Last touched: Today                 │
│   [Extract Chunks]                      │
│                                         │
│ 🎲 D&D Prep                [Neglected]  │
│   • 1 active intention                  │
│   • 3 chunks ready                      │
│   • Last touched: 15 days ago           │
│   [Extract Chunks]                      │
└─────────────────────────────────────────┘
```

**Actions**:
- Click Area → navigate to Area detail
- Quick "Extract chunks" from overview
- Color-coded health indicators
- Sort by: weight, last touched, health status

---

### Flow B: Area Detail Screen (Intentions & Chunks)

**Purpose**: Working context within a single Area.

**Display Structure**:
```
┌─────────────────────────────────────────┐
│ Area: ART Platform                 [Edit]│
├─────────────────────────────────────────┤
│ Active Intentions (2/3)                 │
│                                         │
│ ▼ Improve liquidation indicator         │
│   Ready (5):                            │
│   □ Fix cluster size calc        [45m]  │
│   □ Add volume weighting         [60m]  │
│   □ Write unit tests             [90m]  │
│   □ Update documentation         [30m]  │
│   □ Deploy to staging            [45m]  │
│                                         │
│   Backlog (3):                          │
│   □ Optimize query performance   [120m] │
│   □ Add historical backtest      [90m]  │
│   □ Create dashboard widget      [60m]  │
│                                         │
│   [+ New Chunk] [Extract Chunks]        │
│                                         │
│ ▼ Refactor indicator engine             │
│   Ready (2):                            │
│   ...                                   │
│                                         │
│ Paused Intentions (1)                   │
│ > Add multi-timeframe support           │
│                                         │
│ [+ New Intention]                       │
└─────────────────────────────────────────┘
```

**Actions**:
- Create/Edit/Delete Intentions
- Create Chunks manually
- AI: Extract chunks from Intention
- Drag & drop chunks between statuses
- Quick "Add to today" button on ready chunks
- Move Intentions between Active/Paused

**Validation**:
- Warn when trying to create 4th active Intention
- Show total time estimate for Ready chunks
- Highlight chunks without clear DoD

---

### Flow C: Day Builder (Core Feature)

**Purpose**: Build today's realistic plan from ready chunks.

**Input Parameters**:
```typescript
interface DayBuilderInput {
  timeBudget: number; // e.g., 240 (4 hours) or 360 (6 hours)
  energyMode: 'deep' | 'normal' | 'light';
  maxTasks?: number; // Default: 5, Max: 8
  areaPreferences?: {
    areaId: string;
    weight: number; // Boost/reduce selection probability
  }[];
  lockedChunks?: string[]; // Chunk IDs that must be included
}
```

**AI Selection Logic**:
1. Filter chunks with status === 'ready'
2. Respect lockedChunks (always include)
3. Calculate remaining time budget
4. Score chunks based on:
   - Area weight
   - Area lastTouchedAt (boost neglected areas)
   - Intention priority (active vs paused)
   - energyMode fit (deep work favors longer chunks)
   - Area diversity (prefer mix from 2-3 areas)
5. Select top N chunks fitting time budget
6. Generate reasoning for each selection

**Output Structure**:
```typescript
interface DayPlanSuggestion {
  chunks: {
    chunkId: string;
    order: number;
    reason: string; // Why this chunk was selected
  }[];
  totalDuration: number;
  areaDistribution: {
    areaId: string;
    chunkCount: number;
  }[];
  reasoning: string; // Overall plan rationale
}
```

**UI Display**:
```
┌─────────────────────────────────────────┐
│ Build Today's Plan - Friday, Jan 3      │
├─────────────────────────────────────────┤
│ Time Budget: [4h] [6h] [8h]             │
│ Energy Mode: [ Deep ] Normal   Light    │
│ Max Tasks:   [5▼]                       │
├─────────────────────────────────────────┤
│ AI Suggestion (270 min)                 │
│                                         │
│ 1. ⚡ Fix cluster size calc      [45m]  │
│    → Advances "Improve liquidation"     │
│    → ART not touched for 2 days         │
│    [Accept] [Remove]                    │
│                                         │
│ 2. 🎯 Build Areas list screen   [90m]  │
│    → Advances "MVP day-builder"         │
│    → Deep work suitable                 │
│    [Accept] [Remove] [🔒 Lock]         │
│                                         │
│ 3. ⚡ Add volume weighting      [60m]  │
│    → Same intention as #1               │
│    [Accept] [Remove]                    │
│                                         │
│ 4. 🎲 Write temple lore         [45m]  │
│    → D&D neglected (15 days)            │
│    → Lighter task for balance           │
│    [Accept] [Remove]                    │
│                                         │
│ 5. 🎯 Setup Convex schema       [30m]  │
│    → Quick win, good closer             │
│    [Accept] [Remove]                    │
│                                         │
│ [Regenerate] [Add More] [Finalize Plan] │
└─────────────────────────────────────────┘
```

**User Actions**:
- Accept/Remove individual chunks
- Lock chunks (prevent removal on regenerate)
- Drag to reorder
- Regenerate full plan
- Manually add from Ready chunks
- Finalize → creates DayPlan record

---

### Flow D: End of Day Review

**Purpose**: Quick reflection to improve future planning.

**Display**:
```
┌─────────────────────────────────────────┐
│ End of Day - Friday, Jan 3              │
├─────────────────────────────────────────┤
│ ✅ Completed (3/5)                       │
│ • Fix cluster size calc                 │
│ • Build Areas list screen               │
│ • Add volume weighting                  │
│                                         │
│ ⏭️  Moved to Tomorrow (1)                │
│ • Write temple lore                     │
│                                         │
│ ❌ Cancelled (1)                         │
│ • Setup Convex schema                   │
│   Reason: [Blocked by API issue__]      │
│                                         │
│ 📊 Tasks that felt too big:             │
│ □ Build Areas list screen               │
│   [Split into smaller chunks]           │
│                                         │
│ How was today?                          │
│ Load: ○ Light  ● Normal  ○ Heavy        │
│                                         │
│ Notes: [Optional reflections...]        │
│                                         │
│ [Save & Close Day]                      │
└─────────────────────────────────────────┘
```

**Data Captured**:
```typescript
interface DayReview {
  dayPlanId: string;
  completedChunks: string[];
  movedChunks: { chunkId: string; reason?: string }[];
  cancelledChunks: { chunkId: string; reason?: string }[];
  chunksToSplit: string[];
  perceivedLoad: 'light' | 'normal' | 'heavy';
  notes?: string;
  completedAt: number;
}
```

**Automated Actions**:
- Update chunk statuses
- Move incomplete chunks status back to 'ready'
- Store review data for AI learning
- Trigger split suggestions for marked chunks

---

## AI Features (Detailed Specifications)

### 1. Extract Chunks (From Intention)

**Trigger**: User clicks "Extract Chunks" on an Intention

**Input**:
```typescript
interface ExtractChunksInput {
  intentionId: string;
  intention: {
    title: string;
    description?: string;
  };
  areaContext: {
    title: string;
    description: string;
  };
  existingChunks?: Chunk[]; // To avoid duplicates
  targetChunkCount?: number; // Default: 5, Range: 3-7
}
```

**AI Prompt Template**:
```
You are helping break down a project intention into executable work chunks.

Area: {areaContext.title}
Context: {areaContext.description}

Intention: {intention.title}
{intention.description}

Generate {targetChunkCount} executable chunks that:
1. Take 30-120 minutes each
2. Have clear Definition of Done
3. Can be done independently (minimal blocking)
4. Cover the key aspects of advancing this intention

Existing chunks (avoid duplicates):
{existingChunks}

Return JSON array of chunks:
[{
  "title": "Specific, actionable title",
  "dod": "Clear completion criteria",
  "durationMin": 60,
  "tags": ["coding", "testing"]
}]
```

**Output Validation**:
- Each chunk must have 30 ≤ durationMin ≤ 120
- DoD must be non-empty
- Title must be specific (not generic like "work on X")
- Total should be 3-7 chunks

**UI Flow**:
1. Show modal with generated chunks
2. Allow edit before accepting
3. User can remove/modify individual chunks
4. "Accept All" → creates chunks with status='backlog'
5. User then moves desired chunks to 'ready'

---

### 2. Build Day Plan (From Ready Chunks)

**Trigger**: User clicks "Generate Day Plan" or "Regenerate"

**Selection Algorithm**:
```typescript
interface ChunkScore {
  chunkId: string;
  score: number;
  reasons: string[];
}

function scoreChunk(
  chunk: Chunk,
  area: Area,
  intention: Intention,
  context: DayBuilderInput,
  analytics: { lastTouchedDays: number }
): ChunkScore {
  let score = 0;
  const reasons: string[] = [];

  // Base area weight (0-10)
  score += area.weight;
  reasons.push(`Area priority: ${area.weight}/10`);

  // Neglect bonus (exponential)
  if (analytics.lastTouchedDays > 7) {
    const neglectBonus = Math.min(analytics.lastTouchedDays - 7, 20);
    score += neglectBonus;
    reasons.push(`Area neglected for ${analytics.lastTouchedDays} days`);
  }

  // Energy mode fit
  if (context.energyMode === 'deep' && chunk.durationMin >= 90) {
    score += 5;
    reasons.push('Suitable for deep work');
  } else if (context.energyMode === 'light' && chunk.durationMin <= 45) {
    score += 5;
    reasons.push('Good for light energy mode');
  }

  // Intention status boost
  if (intention.status === 'active') {
    score += 3;
    reasons.push('Active intention');
  }

  // User preference boost
  const pref = context.areaPreferences?.find(p => p.areaId === area.id);
  if (pref) {
    score += pref.weight;
    reasons.push(`User preference: ${pref.weight > 0 ? 'boosted' : 'reduced'}`);
  }

  return { chunkId: chunk.id, score, reasons };
}
```

**Selection Process**:
1. Filter: status === 'ready' && not already in another active plan
2. Score all chunks
3. Sort by score descending
4. Greedy selection:
   - Always include locked chunks
   - Add highest scored chunks while:
     - totalDuration ≤ timeBudget
     - taskCount ≤ maxTasks
     - Maintain area diversity (max 50% from single area)
5. Generate plan-level reasoning

**Output**:
- Ordered list of chunks with individual reasons
- Overall plan reasoning
- Area distribution summary
- Time utilization percentage

---

### 3. Split Chunk (When Too Large)

**Trigger**: User marks chunk as "too big" during end-of-day review

**Input**:
```typescript
interface SplitChunkInput {
  chunkId: string;
  chunk: {
    title: string;
    dod: string;
    durationMin: number;
  };
  reason?: string; // Why it was too big
}
```

**AI Prompt Template**:
```
A work chunk was marked as too large to complete in one session.

Original chunk:
Title: {chunk.title}
Definition of Done: {chunk.dod}
Estimated: {chunk.durationMin} minutes

User feedback: {reason}

Break this into 2-4 smaller chunks that:
1. Each take 30-60 minutes (smaller than original)
2. Can be done sequentially
3. When all complete, achieve the original DoD
4. Are more granular and specific

Return JSON array of new chunks.
```

**UI Flow**:
1. Show AI-generated split suggestions
2. User can edit/approve
3. On accept:
   - Original chunk → status = 'done' (or 'archived')
   - New chunks created with status = 'ready'
   - Maintain link to original for tracking

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: TailwindCSS + shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **State**: Convex React SDK (built-in reactivity)
- **Drag & Drop**: @dnd-kit/core
- **Icons**: Lucide React

### Backend / Data Layer
- **Database**: Convex
  - Real-time subscriptions
  - Built-in authentication
  - Serverless functions (mutations/queries)
- **Schema Management**: Convex schema definitions

### AI Integration
- **Approach**: Next.js API Routes (`/app/api/ai/*`)
- **Provider**: [TO BE DECIDED - Claude API / OpenAI / etc.]
- **Rate Limiting**: Implement per-user rate limits
- **Caching**: Cache common extractions to reduce API calls

### Optional Enhancements (Post-MVP)
- **tRPC**: If complex external integrations needed
- **React Query**: If caching external data beyond Convex
- **Analytics**: Posthog or similar for usage tracking

---

## Database Schema (Convex)

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  areas: defineTable({
    title: v.string(),
    description: v.string(),
    weight: v.number(), // 1-10
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("archived")),
    lastTouchedAt: v.number(),
    health: v.union(v.literal("neglected"), v.literal("normal"), v.literal("urgent")),
  }).index("by_status", ["status"]),

  intentions: defineTable({
    areaId: v.id("areas"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("done")),
    order: v.number(),
  })
    .index("by_area", ["areaId"])
    .index("by_area_status", ["areaId", "status"]),

  chunks: defineTable({
    areaId: v.id("areas"),
    intentionId: v.id("intentions"),
    title: v.string(),
    dod: v.string(), // Definition of Done
    durationMin: v.number(),
    status: v.union(
      v.literal("backlog"),
      v.literal("ready"),
      v.literal("inPlan"),
      v.literal("inProgress"),
      v.literal("done")
    ),
    tags: v.array(v.string()),
    completedAt: v.optional(v.number()),
  })
    .index("by_intention", ["intentionId"])
    .index("by_status", ["status"])
    .index("by_area_status", ["areaId", "status"]),

  dayPlans: defineTable({
    date: v.string(), // ISO date YYYY-MM-DD
    timeBudget: v.number(),
    energyMode: v.union(v.literal("deep"), v.literal("normal"), v.literal("light")),
    notes: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("completed")),
    finalizedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  }).index("by_date", ["date"]),

  dayPlanItems: defineTable({
    dayPlanId: v.id("dayPlans"),
    chunkId: v.id("chunks"),
    order: v.number(),
    locked: v.boolean(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("skipped"),
      v.literal("moved")
    ),
    aiReason: v.optional(v.string()),
    actualDurationMin: v.optional(v.number()),
  })
    .index("by_dayPlan", ["dayPlanId"])
    .index("by_chunk", ["chunkId"]),

  dayReviews: defineTable({
    dayPlanId: v.id("dayPlans"),
    perceivedLoad: v.union(v.literal("light"), v.literal("normal"), v.literal("heavy")),
    notes: v.optional(v.string()),
  }).index("by_dayPlan", ["dayPlanId"]),

  chunkSplits: defineTable({
    originalChunkId: v.id("chunks"),
    newChunkIds: v.array(v.id("chunks")),
    reason: v.optional(v.string()),
  }).index("by_original", ["originalChunkId"]),
});
```

---

## API Endpoints Structure

### Convex Mutations/Queries

```typescript
// Areas
areas/create.ts - Create new area
areas/update.ts - Update area properties
areas/delete.ts - Delete area (cascade intentions/chunks)
areas/list.ts - Get all areas
areas/get.ts - Get single area with details

// Intentions
intentions/create.ts - Create new intention
intentions/update.ts - Update intention
intentions/delete.ts - Delete intention (cascade chunks)
intentions/listByArea.ts - Get intentions for area
intentions/reorder.ts - Update order

// Chunks
chunks/create.ts - Create new chunk
chunks/update.ts - Update chunk
chunks/delete.ts - Delete chunk
chunks/updateStatus.ts - Change chunk status
chunks/listByIntention.ts - Get chunks for intention
chunks/listByStatus.ts - Get all ready/backlog chunks

// Day Plans
dayPlans/create.ts - Create day plan
dayPlans/get.ts - Get plan for specific date
dayPlans/finalize.ts - Mark plan as active
dayPlans/complete.ts - Complete plan and save review
dayPlans/addItem.ts - Add chunk to plan
dayPlans/removeItem.ts - Remove chunk from plan
dayPlans/reorderItems.ts - Update item order

// Analytics
analytics/getAreaHealth.ts - Calculate area health metrics
analytics/getChunkStats.ts - Get completion rates, duration accuracy
```

### Next.js API Routes (AI Functions)

```typescript
// app/api/ai/extract-chunks/route.ts
POST /api/ai/extract-chunks
Input: ExtractChunksInput
Output: Chunk[]

// app/api/ai/build-day-plan/route.ts
POST /api/ai/build-day-plan
Input: DayBuilderInput
Output: DayPlanSuggestion

// app/api/ai/split-chunk/route.ts
POST /api/ai/split-chunk
Input: SplitChunkInput
Output: Chunk[]
```

---

## MVP Feature Checklist

### Phase 1: Core CRUD (Week 1)
- [ ] Setup Next.js + Convex + TailwindCSS
- [ ] Implement Convex schema
- [ ] Areas CRUD (create, list, edit, delete)
- [ ] Intentions CRUD within Area
- [ ] Chunks CRUD within Intention
- [ ] Basic status transitions (backlog → ready → done)

### Phase 2: Day Builder (Week 2)
- [ ] Day Plan creation UI
- [ ] Time budget input
- [ ] Energy mode selector
- [ ] Manual chunk selection (add to plan)
- [ ] Drag & drop reordering
- [ ] Finalize day plan
- [ ] Mark chunks complete/incomplete

### Phase 3: AI Integration (Week 3)
- [ ] Setup AI API endpoint infrastructure
- [ ] Implement "Extract Chunks" AI function
- [ ] Implement "Build Day Plan" AI function
- [ ] Display AI reasoning in UI
- [ ] Locked chunks functionality
- [ ] Regenerate plan feature

### Phase 4: End of Day (Week 4)
- [ ] End of day review screen
- [ ] Mark completed/moved/cancelled
- [ ] Perceived load input
- [ ] "Split chunk" functionality
- [ ] Save review data
- [ ] Auto-update chunk statuses

### Phase 5: Polish (Week 5)
- [ ] Area health indicators
- [ ] Last touched dates
- [ ] Validation error messages
- [ ] Loading states
- [ ] Empty states
- [ ] Keyboard shortcuts
- [ ] Mobile-responsive (basic)

---

## UX Principles

### 1. Minimize Cognitive Load
- **Max visible entities**: 5-7 areas, 2-3 active intentions per area
- **Max daily chunks**: 8 (optimal: 4-6)
- **Single-click actions**: "Add to plan", "Mark done"
- **Clear states**: Visual distinction between backlog/ready/inPlan/done

### 2. Build Trust in AI
- **Always show reasoning**: Why each chunk was selected
- **Allow override**: User can accept/reject/modify all AI suggestions
- **Locked items**: User maintains control over critical tasks
- **Transparent scoring**: Show area weights, neglect periods

### 3. Enforce Healthy Limits
- **Warning at 3 active intentions**: "You have max active intentions"
- **Error at 4th**: Hard block, must pause one first
- **Day plan time check**: Warn if total > timeBudget
- **Chunk duration validation**: Must be 30-120 minutes

### 4. Quick Context Switching
- **Breadcrumbs**: Area > Intention > Chunk
- **Quick actions**: Extract chunks from anywhere
- **Keyboard nav**: Arrow keys, Enter to select, Esc to close
- **Search**: Global search for chunks by title/tags

---

## Technical Considerations & Improvements

### Areas Needing Clarification

1. **AI Provider Selection**
   - [ ] Choose: Claude API, OpenAI, or local model?
   - [ ] Budget: Set monthly AI cost limit
   - [ ] Fallback: What if AI unavailable?

2. **Authentication**
   - [ ] Use Convex built-in auth or external (Clerk)?
   - [ ] Single user or multi-user from start?

3. **Data Export/Backup**
   - [ ] Export day plans to calendar (iCal)?
   - [ ] JSON export of all data?
   - [ ] Automatic backup strategy?

4. **Time Tracking**
   - [ ] Built-in timer for chunks?
   - [ ] Integration with Toggl/RescueTime?
   - [ ] Or just manual duration input?

### Performance Optimizations

1. **Convex Queries**
   - Use specific indexes for all common queries
   - Implement pagination for large chunk lists (>50 items)
   - Cache area health calculations

2. **AI Calls**
   - Debounce "Extract Chunks" clicks (prevent double-calls)
   - Cache common chunk breakdowns for 24h
   - Implement request queue (max 3 concurrent)

3. **UI Rendering**
   - Virtualize long chunk lists (react-window)
   - Lazy load inactive areas
   - Optimize drag-drop performance

### Error Handling

```typescript
// Global error boundary
- API failures → Show retry button + offline queue
- AI timeouts → Fallback to manual chunk creation
- Validation errors → Inline, specific, actionable
- Network issues → Local-first with Convex sync
```

---

## Development Workflow

### Setup (First Time)
```bash
# Create Next.js app
npx create-next-app@latest ai-focus-planner --typescript --tailwind --app

# Setup Convex
npm install convex
npx convex dev

# Install dependencies
npm install @dnd-kit/core @dnd-kit/sortable
npm install react-hook-form zod @hookform/resolvers
npm install date-fns # For date handling
npm install lucide-react # Icons

# Setup shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog input textarea select
```

### Development Process
1. **Schema First**: Define Convex schema for feature
2. **Queries/Mutations**: Implement Convex backend
3. **UI Components**: Build with shadcn/ui
4. **Integration**: Connect UI to Convex
5. **AI Features**: Add AI endpoints last
6. **Testing**: Manual testing in dev

### Deployment
- **Frontend**: Vercel (automatic from main branch)
- **Backend**: Convex (automatic deployment on push)
- **Environment Variables**: Set AI API keys in Vercel

---

## Future Enhancements (Post-MVP)

### Phase 2 Features
- **Templates**: Intention templates (e.g., "Sprint Planning")
- **Recurring chunks**: Weekly/daily repeated tasks
- **Collaboration**: Share areas with team members
- **Calendar sync**: Export to Google Calendar
- **Mobile app**: React Native version

### Phase 3 Features
- **Analytics dashboard**: Completion rates, time accuracy
- **AI learning**: Personalized chunk duration predictions
- **Voice input**: Quick chunk capture
- **Integration**: Jira/Linear/Notion sync
- **Automation**: Auto-move chunks based on patterns

---

## Success Metrics (MVP)

### Usage Metrics
- Daily active usage: 5+ days per week
- Plans completed: >70% of finalized plans
- Chunk completion rate: >60%
- AI acceptance rate: >50% of suggested chunks accepted

### Quality Metrics
- Average chunks per day: 4-6 (optimal range)
- Average active intentions: 2-3 per area
- Time estimate accuracy: ±20 minutes actual vs estimated

### User Satisfaction
- Feature used daily without friction
- Reduces feeling of "overwhelm"
- Provides value in <2 minutes per day interaction

---

## Notes for AI Assistants

When implementing this product:

1. **Start Simple**: Build CRUD before AI features
2. **Validate Early**: Enforce duration/intention limits from day 1
3. **Test AI Prompts**: Iterate prompt templates with real data
4. **Ask When Unclear**: Flag ambiguous requirements above
5. **Prioritize UX**: Better a manual feature that works than AI that confuses

**Critical Rules**:
- NEVER auto-save without user confirmation
- ALWAYS show AI reasoning
- ENFORCE intention limits (2-3 active per area)
- VALIDATE chunk durations (30-120 min)
- PREVENT day plan overload (max 8 tasks)

**Code Standards**:
- TypeScript strict mode
- Zod schemas for all inputs
- Error boundaries on all routes
- Loading states on all async operations
- Accessible UI (keyboard navigation, ARIA labels)

---

## Contact & Feedback

- **Product Owner**: [Your Name]
- **Repository**: [GitHub URL when available]
- **Feedback**: [Email or issue tracker]

Last Updated: 2025-01-02
Version: 1.0 (MVP Specification)
