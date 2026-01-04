# Project Rules

## Component Organization

### Page-Specific Components
Components that are related to a specific page should be placed inside that page's folder structure.

**Rules:**
- If a component is only used on the **Areas page**, it should be in `src/components/areas/`
- If a component is only used on the **Day Builder page**, it should be in `src/components/day-plans/`
- If a component is only used on the **Analytics page**, it should be in `src/components/analytics/`
- If a component is only used on the **Settings page**, it should be in `src/components/settings/`
- And so on for other pages...

**Examples:**
```
✅ CORRECT:
src/components/areas/AreaCard.tsx          # Only used on areas page
src/components/areas/AreaForm.tsx          # Only used on areas page
src/components/areas/AreaHealthBadge.tsx   # Only used on areas page

src/components/intentions/IntentionForm.tsx    # Only used in area detail
src/components/chunks/ChunkCard.tsx            # Only used in area detail

❌ WRONG:
src/components/shared/AreaCard.tsx         # Should be in areas/
src/components/IntentionForm.tsx           # Should be in intentions/
```

### Shared/Global Components
If a component is **global** and can be used on **more than one page**, it should be placed in the `src/components/shared/` folder.

**Examples:**
```
✅ CORRECT:
src/components/shared/LoadingSpinner.tsx   # Used everywhere
src/components/shared/EmptyState.tsx       # Used on multiple pages
src/components/shared/ErrorBoundary.tsx    # Used everywhere
src/components/shared/ConfirmDialog.tsx    # Used on multiple pages

❌ WRONG:
src/components/areas/LoadingSpinner.tsx    # Should be in shared/
```

### UI Components
Base UI components from shadcn/ui should remain in `src/components/ui/` and are exempt from this rule.

**Examples:**
```
✅ CORRECT (UI library components):
src/components/ui/button.tsx
src/components/ui/card.tsx
src/components/ui/dialog.tsx
```

## Summary

| Component Type | Location | Example |
|----------------|----------|---------|
| Page-specific | `src/components/{page-name}/` | `src/components/areas/AreaCard.tsx` |
| Global/Shared | `src/components/shared/` | `src/components/shared/LoadingSpinner.tsx` |
| UI Library | `src/components/ui/` | `src/components/ui/button.tsx` |
| Layout | `src/components/layout/` | `src/components/layout/Header.tsx` |

**When in doubt:** Ask yourself "Is this component used in more than one page/feature?"
- If **YES** → `src/components/shared/`
- If **NO** → `src/components/{feature-name}/`
