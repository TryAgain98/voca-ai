# Security

## Authentication (Clerk)

- Auth is enforced in the admin layout — never duplicate in individual pages.
- Protected routes live under `/[locale]/admin/*`.
- Server-side: `currentUser()` from `@clerk/nextjs/server`.
- Client-side: `useUser()` from `@clerk/nextjs`.
- Redirect unauthenticated users: `redirect(`/${locale}/sign-in`)`.

```ts
// In server layout
import { currentUser } from '@clerk/nextjs/server'
const user = await currentUser()
if (!user) redirect(`/${locale}/sign-in`)
```

## Supabase RLS

- **Always enable RLS** on every new table.
- Never bypass RLS with the service role key on the client.
- Service role key (`SUPABASE_SERVICE_ROLE_KEY`) is server-only — never expose in client bundles.
- Public anon key can be used client-side — it's safe only with RLS enabled.

## Environment Variables

- `.env.local` is gitignored — never commit secrets.
- Prefix client-safe vars with `NEXT_PUBLIC_`.
- Never log secrets, tokens, or user PII.

## Input Validation

- Validate all user input with Zod at the boundary (API routes, server actions).
- Never trust client-supplied IDs without RLS enforcement on the database side.
- Sanitize content before rendering to prevent XSS — Next.js JSX escapes by default; avoid `dangerouslySetInnerHTML`.

## Common Pitfalls to Avoid

- SQL injection: always use Supabase parameterized queries (never string concatenation).
- CSRF: Next.js server actions have built-in CSRF protection — don't bypass it.
- Open redirects: validate redirect URLs before using them.
