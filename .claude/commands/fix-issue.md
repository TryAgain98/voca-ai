# Fix Issue Command

Systematic approach to diagnosing and fixing bugs in voca-ai.

## Process

### 1. Reproduce

- Identify the exact steps to reproduce the issue.
- Note: locale (`/en/` vs `/vi/`), auth state (signed in/out), route.

### 2. Locate the Source

- Is it a **data issue**? → Check the service and Supabase RLS policies.
- Is it a **UI issue**? → Check the component and its React Query hook.
- Is it a **routing issue**? → Check `app/[locale]/` structure and layouts.
- Is it an **auth issue**? → Check Clerk middleware and layout auth guards.
- Is it an **i18n issue**? → Check both `messages/en.json` and `messages/vi.json`.

### 3. Fix

- Edit the smallest possible scope — don't refactor surrounding code.
- No new abstractions unless required by the fix.
- After editing:
  ```bash
  npm run format
  npm run lint:fix
  npx tsc --noEmit
  ```

### 4. Verify

- Test the golden path.
- Test edge cases related to the fix.
- Check for regressions in adjacent features.

## Common Issues

| Symptom                 | Likely Cause                              |
| ----------------------- | ----------------------------------------- |
| 404 on valid route      | Missing `page.tsx` or wrong folder name   |
| RLS error from Supabase | Policy missing or `auth.uid()` mismatch   |
| Hydration mismatch      | Server/client rendering difference        |
| `params` type error     | Forgot to `await params`                  |
| Missing translation key | Not added to both `en.json` and `vi.json` |
| Auth redirect loop      | Clerk middleware misconfigured            |
