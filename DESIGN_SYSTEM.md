# Design System - AI Focus Planner

## Philosophy

> *"Interface should not demand attention - it should free it."*

This design system creates a calm, breathing UI that helps users focus on their day structure without unnecessary visual noise.

**Key Principles:**
- **Minimalism**: Only use color and emphasis when it adds meaning
- **Consistency**: Single source of truth via CSS custom properties
- **Accessibility**: WCAG AA compliance (4.5:1 contrast minimum)
- **Subtlety**: Gentle transitions, minimal shadows, no aggressive animations

**Design Inspirations:**
- Notion (light mode)
- Apple Health
- Linear (light mode)

---

## Color System

### Base Colors

Used for backgrounds, surfaces, and structural elements.

| Token | Value | Hex | Usage |
|-------|-------|-----|-------|
| `--background` | `oklch(1 0 0)` | `#FFFFFF` | Main page background |
| `--background-muted` | `oklch(0.97 0.004 264)` | `#F3F4F6` | Section backgrounds |
| `--surface` | `oklch(1 0 0)` | `#FFFFFF` | Cards, modals, dropdowns |
| `--border` | `oklch(0.922 0.004 264)` | `#E5E7EB` | Component borders, dividers |
| `--foreground` | `oklch(0.145 0 0)` | `#111827` | Primary text color |

**Usage Example:**
```tsx
<div className="bg-background border-border">
  <Card className="bg-surface">...</Card>
</div>
```

---

### Typography Colors

Hierarchical text colors for readability and emphasis.

| Token | Value | Hex | Usage |
|-------|-------|-----|-------|
| `--text-primary` | `oklch(0.223 0.025 264)` | `#111827` | Main headings and body text |
| `--text-secondary` | `oklch(0.456 0.021 264)` | `#4B5563` | Descriptions, labels |
| `--text-muted` | `oklch(0.656 0.013 264)` | `#9CA3AF` | Placeholders, hints |
| `--text-disabled` | `oklch(0.851 0.007 264)` | `#D1D5DB` | Disabled text |

**Usage Example:**
```tsx
<h2 className="text-primary">Heading</h2>
<p className="text-secondary">Description</p>
<span className="text-muted">Hint text</span>
```

---

### Primary (Indigo) - Focus & Action

Used for active elements, selected states, and primary CTAs.

| Token | Value | Hex | Usage |
|-------|-------|-----|-------|
| `--primary` | `oklch(0.556 0.183 274.7)` | `#6366F1` | Primary buttons, active states |
| `--primary-soft` | `oklch(0.963 0.026 274.7)` | `#EEF2FF` | Soft backgrounds for selected items |
| `--primary-hover` | `oklch(0.505 0.194 274.7)` | `#4F46E5` | Hover state for primary actions |
| `--primary-border` | `oklch(0.839 0.076 274.7)` | `#C7D2FE` | Borders for primary elements |
| `--primary-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Text on primary backgrounds |

**Usage Example:**
```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
  Save
</Button>

<Badge className="bg-primary-soft text-primary border-primary-border">
  Active
</Badge>
```

---

### Secondary (Teal) - Completed & Calm

Used for completed tasks, positive feedback, and calm states.

| Token | Value | Hex | Usage |
|-------|-------|-----|-------|
| `--secondary` | `oklch(0.779 0.114 193)` | `#2DD4BF` | Secondary actions, completed chunks |
| `--secondary-soft` | `oklch(0.968 0.025 193)` | `#ECFEFF` | Soft backgrounds for secondary items |
| `--secondary-hover` | `oklch(0.719 0.127 193)` | `#14B8A6` | Hover state for secondary actions |
| `--secondary-border` | `oklch(0.903 0.051 193)` | `#99F6E4` | Borders for secondary elements |
| `--secondary-foreground` | `oklch(0.145 0 0)` | `#111827` | Text on secondary backgrounds |

**Usage Example:**
```tsx
<Badge className="bg-secondary-soft text-secondary border-secondary-border">
  Completed
</Badge>
```

---

### Status Colors (Muted)

Used sparingly for semantic states. **Never use as primary colors.**

#### Success (Green)

| Token | Value | Hex | Usage |
|-------|-------|-----|-------|
| `--success` | `oklch(0.677 0.171 151)` | `#22C55E` | Success messages, completed tasks |
| `--success-soft` | `oklch(0.939 0.079 151)` | `#DCFCE7` | Success backgrounds |
| `--success-border` | `oklch(0.871 0.136 151)` | `#86EFAC` | Success borders |

#### Warning (Amber)

| Token | Value | Hex | Usage |
|-------|-------|-----|-------|
| `--warning` | `oklch(0.768 0.148 75)` | `#F59E0B` | Warning messages, alerts |
| `--warning-soft` | `oklch(0.968 0.052 75)` | `#FEF3C7` | Warning backgrounds |
| `--warning-border` | `oklch(0.907 0.113 75)` | `#FCD34D` | Warning borders |

#### Danger (Red)

| Token | Value | Hex | Usage |
|-------|-------|-----|-------|
| `--danger` | `oklch(0.628 0.227 27)` | `#EF4444` | Error messages, destructive actions |
| `--danger-soft` | `oklch(0.963 0.073 27)` | `#FEE2E2` | Error backgrounds |
| `--danger-border` | `oklch(0.862 0.173 27)` | `#FCA5A5` | Error borders |

**Usage Example:**
```tsx
<AlertDialog>
  <div className="bg-danger-soft border-danger-border">
    <AlertTriangle className="text-danger" />
    <p className="text-danger">This action cannot be undone</p>
  </div>
</AlertDialog>
```

---

## Typography

### Font Family

**Primary:** Inter (Google Fonts)
**Fallback:** `ui-sans-serif, system-ui, sans-serif`

### Type Scale

| Token | Size | Usage |
|-------|------|-------|
| `--text-xs` | 12px (0.75rem) | Small labels, metadata |
| `--text-sm` | 14px (0.875rem) | Body text, buttons, form labels |
| `--text-md` | 16px (1rem) | Default body text |
| `--text-lg` | 18px (1.125rem) | Card titles, section headers |
| `--text-xl` | 20px (1.25rem) | Page section titles |
| `--text-2xl` | 24px (1.5rem) | Page titles, main headings |

### Typography Rules

✓ **Headings:** Use `font-medium` (500 weight)
✓ **Body:** Use `font-normal` (400 weight)
✓ **Emphasis:** Use color, **NOT bold weight**
✓ **Line Height:** Minimum 1.5 for readability

❌ **Never use:** `font-semibold` or `font-bold` for emphasis

**Example:**
```tsx
// ✓ CORRECT
<h1 className="text-2xl font-medium text-primary">Page Title</h1>
<p className="text-md text-secondary">Description text</p>

// ❌ WRONG
<h1 className="text-2xl font-semibold">Page Title</h1>
<p className="text-md font-bold">Emphasized text</p>
```

---

## Spacing & Layout

### Base Unit System

4px grid system with standard increments:

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-unit` | 4px | Base unit |
| `--spacing-2` | 8px | Tight spacing (icon gaps, small padding) |
| `--spacing-3` | 12px | Compact spacing (form fields, small cards) |
| `--spacing-4` | 16px | Standard spacing (button padding, card padding) |
| `--spacing-6` | 24px | Section gaps, card margins |
| `--spacing-8` | 32px | Large section gaps |

### Component Spacing Guidelines

- **Cards:** `p-5` (20px) or `p-6` (24px) for comfortable breathing room
- **Buttons:** `px-4 py-2` (16px/8px) for standard size
- **Section Gaps:** Minimum `gap-6` (24px) between major sections
- **Form Elements:** `gap-4` (16px) between fields

**Example:**
```tsx
<div className="flex flex-col gap-6">
  <Card className="p-6">
    <CardContent className="flex gap-4">...</CardContent>
  </Card>
</div>
```

---

## Border Radius System

Standardized border radius for consistency:

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 10px (0.625rem) | Buttons, inputs, badges |
| `--radius-md` | 12px (0.75rem) | Cards, dialogs, popovers |
| `--radius-lg` | 16px (1rem) | Large containers, area cards |

**Tailwind Mappings:**
- `rounded-lg` → 10px (buttons, inputs)
- `rounded-xl` → 12px (cards, dialogs)
- `rounded-2xl` → 16px (large containers)

---

## Components

### Button

**Variants:**
- **Default:** Primary action (Indigo background)
- **Secondary:** Less prominent action (Teal background)
- **Outline:** Neutral action (border only)
- **Ghost:** Subtle action (no background)
- **Destructive:** Dangerous action (Red background)

**Sizing:**
- **Default:** `h-10` (40px height)
- **Small:** `h-9` (36px height)
- **Large:** `h-11` (44px height)

**Border Radius:** `rounded-lg` (10px)

**Example:**
```tsx
<Button>Primary Action</Button>
<Button variant="outline">Cancel</Button>
<Button variant="destructive">Delete</Button>
```

---

### Card

**Styling:**
- Background: `var(--surface)`
- Border: `1px solid var(--border)`
- Border Radius: `rounded-xl` (12px)
- Shadow: `shadow-sm` (subtle)
- Padding: `p-6` (24px)

**Example:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

---

### Input / Textarea

**Styling:**
- Background: `bg-background`
- Border: `border-input`
- Border Radius: `rounded-lg` (10px)
- Focus Ring: `2px solid var(--primary-soft)`
- Placeholder: `var(--text-muted)`

**Example:**
```tsx
<Input
  type="text"
  placeholder="Enter your text..."
  className="w-full"
/>
```

---

### Dialog / Popover

**Styling:**
- Background: `var(--surface)`
- Border: `1px solid var(--border)`
- Border Radius: `rounded-xl` (12px)
- Shadow: `shadow-md` (medium)
- Overlay: `oklch(0 0 0 / 0.5)` (50% opacity, softer than default 80%)

**Example:**
```tsx
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

---

### Badge

**Font Weight:** `font-medium` (not semibold)
**Border Radius:** `rounded-full`
**Size:** `text-xs` with `px-2.5 py-0.5` padding

**Variants:**
- **Default:** Primary background
- **Secondary:** Secondary/Teal background
- **Outline:** Border only (most common for status badges)
- **Destructive:** Danger/Red background

**Example:**
```tsx
<Badge variant="outline" className="bg-primary-soft text-primary border-primary-border">
  Active
</Badge>
```

---

## Shadows

Use sparingly per minimalism philosophy. Only three shadow levels:

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-subtle` | `0 1px 2px oklch(0 0 0 / 0.04)` | Cards in default state |
| `--shadow-card` | `0 1px 3px oklch(0 0 0 / 0.05)` | Elevated cards |
| `--shadow-dropdown` | `0 8px 24px oklch(0 0 0 / 0.08)` | Dialogs, dropdowns, popovers |

**Tailwind Mappings:**
- `shadow-sm` → Subtle (cards)
- `shadow-md` → Medium (dialogs, popovers)
- ❌ Never use `shadow-lg` or larger

**Anti-pattern:**
```tsx
// ❌ WRONG
<Card className="hover:shadow-lg transition-shadow">

// ✓ CORRECT
<Card className="hover:bg-accent transition-colors">
```

---

## Animations

**Timing Functions:**
- `--transition-fast`: 150ms ease-out (hover states)
- `--transition-normal`: 200ms ease-out (expand/collapse)

**Usage:**
✓ Subtle hover transitions
✓ Focus ring animations
✓ Expand/collapse animations

❌ **Never use:**
- Bounce animations
- Spring physics
- Aggressive easing functions
- Rotating elements (unless for loading spinners)

**Example:**
```tsx
<Button className="transition-colors duration-150 hover:bg-primary-hover">
  Click me
</Button>
```

---

## Anti-Patterns

### ❌ Don't Do This

**1. Hardcoded Tailwind Colors**
```tsx
// ❌ WRONG
<div className="bg-slate-50 text-slate-900 border-slate-200">

// ✓ CORRECT
<div className="bg-muted text-foreground border-border">
```

**2. Excessive Shadows**
```tsx
// ❌ WRONG
<Card className="shadow-lg hover:shadow-xl">

// ✓ CORRECT
<Card className="shadow-sm">
```

**3. Pure Black**
```tsx
// ❌ WRONG
<p className="text-black">

// ✓ CORRECT
<p className="text-foreground">
```

**4. Using Bold for Emphasis**
```tsx
// ❌ WRONG
<span className="font-semibold text-gray-900">Important</span>

// ✓ CORRECT
<span className="font-medium text-primary">Important</span>
```

**5. Status Colors as Primary Colors**
```tsx
// ❌ WRONG
<Button className="bg-green-500">Continue</Button>

// ✓ CORRECT
<Button className="bg-primary">Continue</Button>
```

**6. Inconsistent Border Radius**
```tsx
// ❌ WRONG
<Button className="rounded-md">...</Button>
<Card className="rounded-lg">...</Card>

// ✓ CORRECT
<Button className="rounded-lg">...</Button>  // 10px
<Card className="rounded-xl">...</Card>       // 12px
```

---

## Migration Guide

### Before → After Examples

#### 1. Hardcoded Colors → Semantic Tokens

```tsx
// BEFORE
<div className="bg-slate-50 text-slate-900 border-slate-200">
  <p className="text-blue-600">Primary text</p>
  <span className="text-amber-600">Warning</span>
</div>

// AFTER
<div className="bg-muted text-foreground border-border">
  <p className="text-primary">Primary text</p>
  <span className="text-warning">Warning</span>
</div>
```

#### 2. Excessive Shadows → Subtle Transitions

```tsx
// BEFORE
<Card className="shadow-md hover:shadow-lg transition-shadow">
  Content
</Card>

// AFTER
<Card className="shadow-sm hover:bg-accent transition-colors duration-150">
  Content
</Card>
```

#### 3. Font Weights → Color for Emphasis

```tsx
// BEFORE
<h2 className="text-2xl font-semibold">Heading</h2>
<p className="font-bold">Important text</p>

// AFTER
<h2 className="text-2xl font-medium">Heading</h2>
<p className="font-medium text-primary">Important text</p>
```

#### 4. Custom CSS Classes → Semantic Tokens

```tsx
// BEFORE
<Badge className="health-urgent" />
<Badge className="status-inProgress" />

// AFTER
<Badge className="bg-warning-soft text-warning border-warning-border" />
<Badge className="bg-secondary-soft text-secondary border-secondary-border" />
```

---

## Design Tokens Reference

### Complete Color Token Table

| Category | Token | OKLch Value | Hex | Usage |
|----------|-------|-------------|-----|-------|
| **Base** | --background | oklch(1 0 0) | #FFFFFF | Main background |
| | --background-muted | oklch(0.97 0.004 264) | #F3F4F6 | Section backgrounds |
| | --surface | oklch(1 0 0) | #FFFFFF | Cards, modals |
| | --border | oklch(0.922 0.004 264) | #E5E7EB | Borders, dividers |
| | --foreground | oklch(0.145 0 0) | #111827 | Primary text |
| **Typography** | --text-primary | oklch(0.223 0.025 264) | #111827 | Headings, body |
| | --text-secondary | oklch(0.456 0.021 264) | #4B5563 | Labels, descriptions |
| | --text-muted | oklch(0.656 0.013 264) | #9CA3AF | Placeholders, hints |
| | --text-disabled | oklch(0.851 0.007 264) | #D1D5DB | Disabled text |
| **Primary** | --primary | oklch(0.556 0.183 274.7) | #6366F1 | Indigo 500 |
| | --primary-soft | oklch(0.963 0.026 274.7) | #EEF2FF | Indigo 50 |
| | --primary-hover | oklch(0.505 0.194 274.7) | #4F46E5 | Indigo 600 |
| | --primary-border | oklch(0.839 0.076 274.7) | #C7D2FE | Indigo 200 |
| | --primary-foreground | oklch(1 0 0) | #FFFFFF | White |
| **Secondary** | --secondary | oklch(0.779 0.114 193) | #2DD4BF | Teal 400 |
| | --secondary-soft | oklch(0.968 0.025 193) | #ECFEFF | Teal 50 |
| | --secondary-hover | oklch(0.719 0.127 193) | #14B8A6 | Teal 500 |
| | --secondary-border | oklch(0.903 0.051 193) | #99F6E4 | Teal 200 |
| | --secondary-foreground | oklch(0.145 0 0) | #111827 | Dark gray |
| **Success** | --success | oklch(0.677 0.171 151) | #22C55E | Green 500 |
| | --success-soft | oklch(0.939 0.079 151) | #DCFCE7 | Green 100 |
| | --success-border | oklch(0.871 0.136 151) | #86EFAC | Green 300 |
| **Warning** | --warning | oklch(0.768 0.148 75) | #F59E0B | Amber 500 |
| | --warning-soft | oklch(0.968 0.052 75) | #FEF3C7 | Amber 100 |
| | --warning-border | oklch(0.907 0.113 75) | #FCD34D | Amber 300 |
| **Danger** | --danger | oklch(0.628 0.227 27) | #EF4444 | Red 500 |
| | --danger-soft | oklch(0.963 0.073 27) | #FEE2E2 | Red 100 |
| | --danger-border | oklch(0.862 0.173 27) | #FCA5A5 | Red 300 |

### Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| --spacing-unit | 4px | Base unit |
| --spacing-2 | 8px | Tight spacing |
| --spacing-3 | 12px | Compact spacing |
| --spacing-4 | 16px | Standard spacing |
| --spacing-6 | 24px | Section gaps |
| --spacing-8 | 32px | Large gaps |

### Typography Scale

| Token | Value | Usage |
|-------|-------|-------|
| --text-xs | 0.75rem (12px) | Small labels |
| --text-sm | 0.875rem (14px) | Body text, buttons |
| --text-md | 1rem (16px) | Default body |
| --text-lg | 1.125rem (18px) | Card titles |
| --text-xl | 1.25rem (20px) | Section titles |
| --text-2xl | 1.5rem (24px) | Page titles |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| --radius-sm | 0.625rem (10px) | Buttons, inputs |
| --radius-md | 0.75rem (12px) | Cards, dialogs |
| --radius-lg | 1rem (16px) | Large containers |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| --shadow-subtle | 0 1px 2px oklch(0 0 0 / 0.04) | Default cards |
| --shadow-card | 0 1px 3px oklch(0 0 0 / 0.05) | Elevated cards |
| --shadow-dropdown | 0 8px 24px oklch(0 0 0 / 0.08) | Dialogs, popovers |

### Overlay

| Token | Value | Usage |
|-------|-------|-------|
| --overlay-bg | oklch(0 0 0 / 0.5) | Dialog/modal overlays (50% opacity) |

### Animation Timing

| Token | Value | Usage |
|-------|-------|-------|
| --transition-fast | 150ms ease-out | Hover states |
| --transition-normal | 200ms ease-out | Expand/collapse |

---

## Dark Mode Support

All color tokens automatically switch in dark mode via CSS custom properties. The design system maintains the same visual hierarchy in both light and dark themes.

**Key Dark Mode Adjustments:**
- Backgrounds become darker while maintaining contrast ratios
- Primary and secondary colors remain consistent
- Text colors invert but maintain hierarchy
- Shadows adjust for visibility on dark backgrounds

---

## Accessibility

**WCAG AA Compliance:**
- All text colors meet 4.5:1 contrast ratio minimum
- Focus rings visible on all interactive elements
- Color is never the only indicator of state
- Semantic HTML structure maintained

**Keyboard Navigation:**
- All components support keyboard navigation
- Focus rings use `focus-visible` (keyboard-only)
- Tab order follows logical page flow

---

## Final Notes

This design system is self-documenting through CSS custom properties. All tokens are defined in `/src/styles/globals.css` and can be referenced throughout the application.

**When in doubt:**
1. Check if a semantic token exists
2. Use the most specific token available
3. Never hardcode colors
4. Maintain the 4px spacing rhythm
5. Keep shadows subtle

For questions or updates to this design system, please refer to the implementation in `globals.css` as the single source of truth.
