# # Done — Commit & Push

Run this after completing any task.

## Steps

1. **Format & Lint**
   ```bash
   npm run format -- --loglevel warn && npm run lint:fix -- --quiet
   Fix all remaining errors manually if needed. Do not proceed with lint errors.
   ```

Type check

Bash
npx tsc --noEmit --pretty false
Stop and report errors if this fails.

Stage & commit

Bash
git add .
git commit -m "<type>(<scope>): <description>"
Write the commit message based on what actually changed. Follow Conventional Commits format. Skip if no changes.

Push

Bash
git push origin main --quiet && echo "Hash: $(git rev-parse --short HEAD)"
Output Rules (Token Saving)
Silent Success: Do not output terminal logs for successful steps. Just say "OK".

Concise Errors: If a step fails, only show the relevant error lines.

Final Report: Only provide the short commit hash and push status.
