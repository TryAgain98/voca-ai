# CORE DEVELOPMENT & STYLE

- **Stack**: Next.js 15+ (App Router), React 19, TS Strict, Supabase, Clerk, Tailwind v4, shadcn/ui.
- **State**: TanStack Query v5 (Server), Zustand v5 (Client), Zod (Validation).
- **i18n**: next-intl v4 (`en`, `vi`). Keep `messages/*.json` synced.

## 📁 Directory Constraints

- `app/[locale]/`: Routing ONLY. **No business logic.**
- `components/ui/`: shadcn ONLY. No hand-coding primitives.
- `hooks/`: Query hooks (1 file/resource). `services/`: Data access (extend `BaseService`).
- `lib/`: Stateless utils. `types/`: Shared interfaces (Barrel exports).
- `supabase/migrations/`: **Read-only.** Never edit pushed migrations.
- **Imports**: Always use `~/` (project root) or `~admin/` (admin routes). **Ban**: `../`, `../../`, or `@/`.
  - `~admin/` → `app/[locale]/admin/` — use for any import within the admin section (e.g., `~admin/review/_types/review.types`).

## 💻 Coding Standards

- **TS**: No `any`. Use `z.infer` for types. Explicit return types required.
- **Components**: Server-first. `use client` only if needed. **Always await `params`/`searchParams`.**
- **Naming**: kebab-case for components (`my-component.tsx`) and hooks (`use-name.ts`).
- **Services**: `{name}.service.ts`. **Stores**: `{name}.ts`.
- **Comments**: **Default: NONE.** Only explain "WHY" for hacks or non-obvious logic.
- **Quality**: Run `npm run format && npm run lint:fix` after every edit. Zero lint errors allowed.

## Performance & Optimization

- **Principle**: Readable code first. **Ban**: Premature optimization.
- **Memoization**: Only use `useMemo`/`useCallback` for expensive computations or stable props for memoized children. **Ban**: Memoizing primitives or one-liners.
- **React.memo**: Use only for components with stable props that re-render frequently/expensive.
- **State Management**: Use `useReducer` for ≥3 related fields; `useState` for simple/independent ones.
- **Loading**:
  - `next/dynamic`: Only for large, non-critical components (e.g., Editors). Always provide a skeleton.
  - **Images**: 100% `next/image`. Mandatory `width`/`height` (or `fill`). `priority` for LCP only.
- **Lists**: Always use stable IDs as `key`. **Ban**: Array index. Virtualize if >100 items.

## Internationalization (next-intl v4)

- **Locales**: `en` (default), `vi`. Files: `messages/*.json`.
- **Constraint**: **Zero hardcoded strings** in JSX. All user-visible text must use `t()`.
- **Sync**: Always update `en.json` and `vi.json` simultaneously.
- **Usage**: `getTranslations` (Server), `useTranslations` (Client). **Ban** cross-usage.

## Database & Migrations

- **Rules**: 1 schema change = 1 new migration. **Never edit pushed migrations.**
- **Naming**: Descriptive snake_case (e.g., `create_lessons_table`).
- **Commands**: `db:new`, `db:push`, `db:pull`, `db:status`.
- **SQL**: Always enable **RLS** on new tables
