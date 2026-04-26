# Skill: Deploy

Runs the full deploy sequence for voca-ai.

## Trigger

When the user says: "deploy", "ship it", "push to production", or "run deploy".

## Steps

1. **Type check**

   ```bash
   npx tsc --noEmit
   ```

   Stop and report errors if this fails.

2. **Build**

   ```bash
   npm run build
   ```

   Stop and report errors if this fails.

3. **Push DB migrations** (if any pending)

   ```bash
   npm run db:status
   npm run db:push
   ```

4. **Commit & push** (if changes are uncommitted)
   - Summarize changes.
   - Create commit with Conventional Commits format.
   - Push to `main` (or current branch).

5. **Confirm deploy**
   - If using Vercel: pushing to `main` triggers auto-deploy.
   - Report the expected deploy URL to the user.

## Abort Conditions

- TypeScript errors → fix first, then redeploy.
- Build errors → fix first, then redeploy.
- Uncommitted changes + unresolved lint errors → fix first.
