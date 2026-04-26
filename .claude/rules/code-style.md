# Code Style

## TypeScript

- **No `any`** — use `unknown`, generics, or proper types. `as never` allowed only in BaseService internals.
- `interface` for object shapes (entities, props). `type` for unions, mapped types, aliases.
- Always type function return values when not obvious.
- Derive types from Zod: `z.infer<typeof schema>` — don't duplicate manually.
- Strict mode is ON — never disable.

## Comments

- Default: **no comments**.
- Only comment when the WHY is non-obvious: hidden constraint, subtle invariant, specific bug workaround.
- Never describe WHAT the code does — well-named identifiers do that.
- No multi-line comment blocks or docstrings.

## Components

- Server Components by default (layouts, pages).
- Add `'use client'` only when using hooks, state, or browser APIs.
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
  // ...
}
```

## File Naming

| Type      | Convention              | Example               |
| --------- | ----------------------- | --------------------- |
| Service   | `{resource}.service.ts` | `lessons.service.ts`  |
| Hook file | `use-{resource}.ts`     | `use-lessons.ts`      |
| Component | `kebab-case.tsx`        | `locale-switcher.tsx` |
| Store     | `{name}.ts`             | `counter.ts`          |

## Formatting

Run after every file create/edit:

```bash
npm run format
npm run lint:fix
```

Never leave lint errors unresolved.
