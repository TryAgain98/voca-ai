## Component & Code Quality (Strict)

- **Size Limit**: Max **200 lines** per file. If exceeded: extract sub-components, hooks, or utils.
- **Organization**: Use `_components/`, `_hooks/`, `_utils/`, `_types/` inside page folders for private logic.
- **DRY (3-Strikes Rule)**: Extract logic/utils if used in ≥3 places. Use `lib/` for shared, inline for single-use.
- **Naming**:
  - Booleans: Must start with `is`, `has`, `can`, `should`, `did`.
  - Generic: **Ban** `data`, `info`, `temp`. Use descriptive names (e.g., `userProfile`).
  - Handlers: Specific (e.g., `handleLessonDelete`) over generic (`handleClick`).

## Patterns & Constraints

- **Clean Code**:
  - Use **Guard Clauses** (Early returns). Max nesting depth: 2.
  - **Ban** magic strings/numbers. Use top-level `const`.
  - **Ban** commented-out code, `console.log`, and `TODO` comments.
- **React**:
  - One responsibility per component. Split if >8 props or >3 nesting levels in JSX.
  - **No Prop Drilling**: Max 2 levels. Use Zustand/Context for deeper sharing.
  - **Hooks**: Return named objects instead of tuples (if >2 items). Define explicit Input/Return types.
- **Types**: Always derive from Zod `z.infer<>` where possible. No manual duplication.
