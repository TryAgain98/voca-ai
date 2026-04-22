<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

# Project Rules

## Workflow — after every file create or edit

```bash
npm run format   # format first
npm run lint:fix # then lint — fix all remaining errors manually if needed
```

Never leave lint errors unresolved.

---

## TypeScript

- **No `any`** — use `unknown`, generics, or proper types instead. `as never` is acceptable only in BaseService internals where Supabase types conflict.
- Use `interface` for object shapes (entities, props). Use `type` for unions, mapped types, and utility aliases.
- Always type function return values when not obvious.
- Prefer `z.infer<typeof schema>` to derive types from Zod schemas rather than defining them manually.
- Strict mode is on — do not disable it.

---

## Import paths

Always use `~/` alias. Never use relative paths (`../`) or `@/`.

```ts
// ✅
import { cn } from '~/lib/cn'
import { lessonsService } from '~/services/lessons.service'
import type { Lesson } from '~/types'

// ❌
import { cn } from '../lib/cn'
import { cn } from '@/lib/cn'
```

---

## Folder structure — what goes where

```
services/   Pure data access. No React. Extend BaseService.
hooks/      React Query hooks only. Call services, never Supabase directly.
components/
  ui/       shadcn components only — do not hand-code primitives here.
  layout/   Shared layout pieces (Sidebar, ThemeToggle, LocaleSwitcher…).
lib/        Stateless utilities: cn, supabase client, dayjs, currency, schemas.
types/      Shared TypeScript interfaces/types. Barrel-export from index.ts.
stores/     Zustand stores only.
providers/  React context providers and app-wide wrappers.
app/        Next.js routes only. No business logic.
```

---

## Service layer

Every Supabase table gets its own service that extends `BaseService`:

```ts
// services/example.service.ts
import type { Example } from '~/types'
import { BaseService } from './base.service'

type ExampleInsert = { name: string; description?: string }
type ExampleUpdate = Partial<ExampleInsert>

class ExampleService extends BaseService<
  Example,
  ExampleInsert,
  ExampleUpdate
> {
  constructor() {
    super('examples')
  }
}

export const exampleService = new ExampleService()
```

- Export a singleton instance, not the class.
- Services throw errors directly — React Query catches them.
- Add table-specific methods (e.g. `findBySlug`) by overriding in the subclass.

---

## React Query hooks

- One file per resource: `hooks/use-{resource}.ts`
- Export all hooks from the same file: `useX`, `useCreateX`, `useUpdateX`, `useDeleteX`
- Query keys are a simple array matching the resource name: `['lessons']`
- Mutations always invalidate the related query on success and call `toast`

```ts
export function useCreateLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: LessonInsert) => lessonsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lessons'] })
      toast.success('Lesson created')
    },
    onError: () => toast.error('Failed to create lesson'),
  })
}
```

---

## UI — shadcn only

- All buttons, inputs, modals, tables, dialogs, cards — use shadcn from `components/ui/`.
- If a component is missing: `npx shadcn add <component>`, never hand-code it.
- Use design tokens (`bg-background`, `text-muted-foreground`, `border-border`, `text-destructive`…) — no raw hex or hardcoded zinc/gray classes.
- For sidebar, use sidebar tokens: `bg-sidebar`, `text-sidebar-foreground`, `bg-sidebar-accent`, `border-sidebar-border`.

---

## Client vs Server components

- Layouts and pages are **Server Components** by default.
- Add `'use client'` only when using hooks, state, or browser APIs.
- Auth check in server layouts via `currentUser()` from `@clerk/nextjs/server`.
- Interactive pages (React Query, useState) must be `'use client'`.
- `params` is always `Promise<{ locale: string }>` — always `await params`.

```ts
// Server layout pattern
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await currentUser()
  if (!user) redirect(`/${locale}/sign-in`)
  // ...
}
```

---

## Authentication (Clerk)

- Auth is enforced in the admin layout, not duplicated in individual pages.
- Protected routes live under `/[locale]/admin/*`.
- Use `currentUser()` server-side, `useUser()` client-side.
- After sign-in/sign-up, redirect to `/admin` (set in `.env.local`).

---

## i18n (next-intl)

- Locales: `en`, `vi`. Default: `en`.
- URL structure: `/{locale}/route` — locale is always the first segment.
- Get locale server-side via `params`, client-side via `useLocale()`.
- Switch locale by replacing the locale segment in the current pathname:
  ```ts
  const newPath = pathname.replace(`/${locale}`, `/${next}`)
  router.push(newPath)
  ```
- Add translations to both `messages/en.json` and `messages/vi.json`.

---

## File naming

| Type      | Convention                  | Example                   |
| --------- | --------------------------- | ------------------------- |
| Service   | `{resource}.service.ts`     | `lessons.service.ts`      |
| Hook file | `use-{resource}.ts`         | `use-lessons.ts`          |
| Component | `kebab-case.tsx`            | `locale-switcher.tsx`     |
| Store     | `{name}.ts`                 | `counter.ts`              |
| Type      | defined in `types/index.ts` | `export interface Lesson` |

---

## Migrations (Supabase)

- Every schema change = new migration file. Never edit an already-pushed migration.
- Use `npm run db:new -- <name>` to create, `npm run db:push` to apply.
- Document SQL patterns in `supabase/GUIDE.md`.
