# Git Workflow

## Commit Message Format (Conventional Commits)

This project uses `commitlint` with `@commitlint/config-conventional`. All commits must follow:

```
<type>(<scope>): <short description>

[optional body]
```

### Types

| Type       | When to use                        |
| ---------- | ---------------------------------- |
| `feat`     | New feature                        |
| `fix`      | Bug fix                            |
| `refactor` | Code change that's not feat or fix |
| `chore`    | Build/config/dependency changes    |
| `docs`     | Documentation only                 |
| `style`    | Formatting, no logic change        |
| `test`     | Adding or updating tests           |
| `perf`     | Performance improvement            |

### Examples

```
feat(lessons): add create lesson form
fix(auth): redirect to locale-prefixed sign-in
chore(deps): upgrade next to 16.2.4
refactor(services): extract base query builder
```

## Pre-commit Hooks (Husky + lint-staged)

Automatically runs on staged files:

- `.ts/.tsx/.js/.jsx/.mjs` → `eslint --fix` + `prettier --write`
- `.json/.css/.md` → `prettier --write`

Never skip hooks (`--no-verify`) unless explicitly asked.

## Branch Strategy

- `main` — production-ready code
- `feat/<name>` — feature branches
- `fix/<name>` — bug fix branches

Always create a PR for review before merging to `main`.
