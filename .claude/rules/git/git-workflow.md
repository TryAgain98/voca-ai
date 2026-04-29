## Git Workflow (Conventional Commits)

- **Format**: `<type>(<scope>): <description>`.
- **Types**: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`, `perf`.
- **Hooks**: Husky + lint-staged are active. **Never** use `--no-verify`.
- **Branching**: `main` (prod), `feat/*`, `fix/*`. PR required for `main` merges.
- **Auto-fix**: Linting/Formatting runs automatically on commit. Fix all errors before pushing.
