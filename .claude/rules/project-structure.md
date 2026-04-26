# Project Structure

## Stack

- Next.js 16.2.4 (App Router) — read `node_modules/next/dist/docs/` before writing Next.js code
- React 19 + TypeScript (strict mode)
- Supabase (database + storage)
- Clerk (authentication)
- Tailwind CSS v4 + shadcn/ui
- React Query v5 (TanStack Query)
- next-intl v4 (i18n: `en`, `vi`)
- Zustand v5 (client state)
- Zod v4 (validation)

## Directory Map

```
app/                  Next.js routes ONLY — no business logic
  [locale]/
    (public)/         Public pages (sign-in, sign-up, landing)
    admin/            Protected routes — auth enforced in layout
components/
  ui/                 shadcn ONLY — never hand-code primitives
  layout/             Sidebar, ThemeToggle, LocaleSwitcher, etc.
hooks/                React Query hooks — one file per resource
lib/                  Stateless utils: cn, supabase client, dayjs
services/             Pure data access — extends BaseService
stores/               Zustand stores only
providers/            React context + app-wide wrappers
types/                Shared interfaces — barrel export from index.ts
messages/             i18n: en.json + vi.json (always keep in sync)
supabase/
  migrations/         Never edit pushed migrations
  GUIDE.md            SQL patterns reference
```

## Import Alias

Always use `~/` — never `../` or `@/`.

```ts
import { cn } from '~/lib/cn'
import { lessonsService } from '~/services/lessons.service'
import type { Lesson } from '~/types'
```
