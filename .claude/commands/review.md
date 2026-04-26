# Review Command

Code review checklist for voca-ai pull requests.

## Review Checklist

### TypeScript

- [ ] No `any` types — uses `unknown`, generics, or proper types
- [ ] Function return types are explicit where non-obvious
- [ ] Zod schemas used for validation, types derived with `z.infer<>`
- [ ] Strict mode compliance

### Architecture

- [ ] Import paths use `~/` alias (not `../` or `@/`)
- [ ] Business logic is NOT in `app/` — it belongs in `services/` or `hooks/`
- [ ] Services extend `BaseService` and export a singleton
- [ ] React Query hooks follow the standard pattern (invalidate + toast)
- [ ] No Supabase calls outside of `services/`

### UI

- [ ] Only shadcn components used (no hand-coded primitives)
- [ ] Design tokens used (no raw hex, no hardcoded zinc/gray)
- [ ] `'use client'` only added when strictly necessary

### Auth & Security

- [ ] New routes under `/admin/` are covered by the layout auth guard
- [ ] New Supabase tables have RLS enabled + policies defined
- [ ] No secrets in client-accessible code

### i18n

- [ ] New UI strings added to both `messages/en.json` and `messages/vi.json`
- [ ] No hardcoded English strings in components

### Database

- [ ] New schema changes have a migration file (not editing pushed migrations)
- [ ] Migration name is descriptive

### Workflow

- [ ] `npm run format` + `npm run lint:fix` run — zero lint errors
- [ ] `npx tsc --noEmit` passes
- [ ] Commit message follows Conventional Commits format
