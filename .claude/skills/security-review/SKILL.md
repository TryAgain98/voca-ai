# Skill: Security Review

Performs a security review of changes in the current branch.

## Trigger

When the user says: "security review", "check security", or "audit this".

## Review Areas

### 1. Authentication

- Are all `/admin/*` routes protected by the Clerk layout guard?
- Is `currentUser()` used server-side (not client-side workarounds)?
- Are sign-in redirects locale-aware (`/${locale}/sign-in`)?

### 2. Supabase RLS

- Does every new table have `ENABLE ROW LEVEL SECURITY`?
- Are RLS policies correctly scoped (`auth.uid() = user_id`)?
- Is the service role key (`SUPABASE_SERVICE_ROLE_KEY`) server-only?

### 3. Input Validation

- Is all user input validated with Zod at the boundary?
- Are server actions using `@conform-to/zod` for form validation?
- No raw SQL string concatenation?

### 4. Secrets & Environment

- No secrets committed (check `.env.local` is in `.gitignore`)?
- No `NEXT_PUBLIC_` prefix on server-only secrets?
- No secrets logged to console?

### 5. XSS

- No `dangerouslySetInnerHTML` with user content?
- No unescaped user content in rendered HTML?

### 6. Dependencies

- Any new `npm install`? Check for known vulnerabilities: `npm audit`.

## Output Format

Report findings as:

- **CRITICAL** — exploitable, fix before deploy
- **HIGH** — serious risk, fix soon
- **MEDIUM** — should fix in next sprint
- **INFO** — best practice, low risk
