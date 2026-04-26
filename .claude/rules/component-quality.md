# Component Quality

## File Size Limit — 200 Lines Max

Every component file must stay under 200 lines. If it exceeds this:

1. Extract sub-components into separate files in the same folder.
2. Extract hooks into `hooks/` (local or global — see below).
3. Extract constants/helpers into `utils/` (local or global — see below).
4. If the page folder grows past 3 extracted files, give it its own folder structure:

```
app/[locale]/admin/lessons/
  page.tsx                 # ≤200 lines — orchestration only
  _components/
    lesson-table.tsx
    lesson-form.tsx
    lesson-filters.tsx
  _hooks/
    use-lesson-filters.ts
  _utils/
    format-lesson.ts
  _types/
    lesson-form.types.ts
```

Prefix local folders with `_` to signal they are page-private.

---

## Utils Placement Rule

| Scenario                                 | Where to put it                           |
| ---------------------------------------- | ----------------------------------------- |
| Used by ≥2 different pages/features      | `lib/utils/` (or `lib/{domain}.utils.ts`) |
| Used only inside one page/feature folder | `{page}/_utils/{name}.ts`                 |
| Used only inside one component file      | Inline — no extraction needed yet         |

Never copy-paste a helper. If you need it twice, extract and share it.

---

## Types Placement Rule

| Scenario                        | Where to put it                          |
| ------------------------------- | ---------------------------------------- |
| Shared across multiple features | `types/index.ts` barrel export           |
| Local to one page/feature       | `{page}/_types/{name}.types.ts`          |
| Derived from Zod schema         | Inline with the schema using `z.infer<>` |

Never define a type manually if a Zod schema already describes the same shape.

---

## Hooks

- Hooks must export explicit input parameter types and return types.
- Never return a plain tuple when the shape has more than 2 items — return a named object.

```ts
// ✅
interface UseLessonFiltersInput {
  initialPage?: number
}

interface UseLessonFiltersReturn {
  filters: LessonFilters
  page: number
  setPage: (page: number) => void
  resetFilters: () => void
}

export function useLessonFilters(
  input: UseLessonFiltersInput = {}
): UseLessonFiltersReturn { ... }

// ❌
export function useLessonFilters(initialPage?: number) {
  return [filters, page, setPage, resetFilters] as const
}
```

- Hooks that belong to one page live in `{page}/_hooks/`.
- Hooks used across multiple pages live in the top-level `hooks/` folder.

---

## Early Return Over Nested Conditionals

Prefer guard clauses (early returns) over nested `if/else`. Max nesting depth: 2.

```ts
// ✅
function getLabel(status: Status): string {
  if (status === 'draft') return 'Draft'
  if (status === 'published') return 'Published'
  return 'Unknown'
}

// ❌
function getLabel(status: Status): string {
  if (status === 'draft') {
    return 'Draft'
  } else {
    if (status === 'published') {
      return 'Published'
    } else {
      return 'Unknown'
    }
  }
}
```

In React components, guard early for loading/error/empty states before the main render:

```tsx
// ✅
if (isLoading) return <Skeleton />
if (error) return <ErrorState error={error} />
if (!data.length) return <EmptyState />

return <LessonTable data={data} />
```

---

## Constants Over Magic Values

Declare values as `const` (or `as const`) when they never change. Never embed magic strings or numbers inline.

```ts
// ✅
const MAX_FILE_SIZE_MB = 5
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

// ❌
if (file.size > 5 * 1024 * 1024) { ... }
if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { ... }
```

Module-level constants go at the top of the file, above the component definition. If a constant is reused across files, move it to `lib/constants.ts` or a domain-specific `lib/{domain}.constants.ts`.

---

## Component Responsibilities

A component should do **one thing**. If its name requires "and" to describe it, split it.

| Signal                                              | Action                                 |
| --------------------------------------------------- | -------------------------------------- |
| Component has >1 `useEffect` doing unrelated things | Extract each concern into its own hook |
| JSX has >3 levels of conditional nesting            | Extract to a sub-component             |
| Props interface has >8 props                        | Consider splitting or composing        |
| Render contains both data fetching and layout       | Separate container from presentational |

**Container / Presentational split:**

```tsx
// Container — data + logic
export function LessonListContainer() {
  const { data, isLoading } = useLessons()
  return <LessonList lessons={data} isLoading={isLoading} />
}

// Presentational — pure rendering, no hooks
interface LessonListProps {
  lessons: Lesson[]
  isLoading: boolean
}

export function LessonList({ lessons, isLoading }: LessonListProps) { ... }
```

---

## Avoid Prop Drilling Beyond 2 Levels

If a prop is passed through 2 or more intermediate components without being used, it belongs in:

- A Zustand store (shared mutable state), or
- A React context (shared read-heavy state), or
- Colocated closer to where it's consumed.

---

## Dead Code Policy

- Never commit commented-out code.
- Never leave `console.log` in committed files.
- Never leave `TODO` comments — convert them to a tracked issue or fix them now.
- Unused imports are a lint error — fix, don't suppress.

---

## Naming Precision

| Pattern to avoid                      | Use instead                              |
| ------------------------------------- | ---------------------------------------- |
| `data`, `info`, `stuff`               | `lessons`, `userProfile`, `filters`      |
| `handleClick` (generic)               | `handleLessonDelete`, `handleFormSubmit` |
| `isTrue`, `flag`, `bool`              | `isLoading`, `hasPermission`, `isOpen`   |
| `temp`, `tmp`, `foo`, `bar`           | A real descriptive name                  |
| Component named `Page` or `Component` | Named after what it renders              |

Boolean variables and props must start with `is`, `has`, `can`, `should`, or `did`.

---

## Duplication Threshold

**Three strikes rule**: if you write the same logic a third time, extract it. Two similar instances may be coincidence. Three is a pattern that needs a shared abstraction.
