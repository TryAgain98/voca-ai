# Testing

## Current State

No test framework is configured yet. When adding tests, prefer:

- **Vitest** for unit tests (compatible with Vite/Next.js ecosystem)
- **Playwright** for E2E tests

## What to Test

Focus on:

1. Service layer logic (Supabase query building, error paths)
2. Utility functions in `lib/`
3. Zod schema validation
4. Critical user flows E2E (auth, core CRUD)

## What NOT to Test

- shadcn UI components (already tested by the library)
- Simple pass-through hooks that just call a service
- Next.js routing behavior

## Test File Placement

```
services/__tests__/lessons.service.test.ts
lib/__tests__/cn.test.ts
```

## Principles

- Test behavior, not implementation.
- No mocking Supabase — integration tests hit a real test database.
- Keep tests independent — no shared mutable state between tests.
- If a test is hard to write, it often means the code needs refactoring, not more mocking.
