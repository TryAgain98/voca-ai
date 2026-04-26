# Done — Commit & Push

Run this after completing any task.

## Steps

1. **Format**

   ```bash
   npm run format
   ```

2. **Lint**

   ```bash
   npm run lint:fix
   ```

   Fix all remaining errors manually if needed. Do not proceed with lint errors.

3. **Type check**

   ```bash
   npx tsc --noEmit
   ```

   Stop and report errors if this fails.

4. **Stage & commit**

   ```bash
   git add -A
   git commit -m "<type>(<scope>): <description>"
   ```

   Write the commit message based on what actually changed. Follow Conventional Commits format.

5. **Push**

   ```bash
   git push origin main
   ```

6. Report the commit hash and push result to the user.
