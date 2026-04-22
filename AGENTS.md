<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Project Rules

## UI

Always use shadcn components from `components/ui/` for all UI work. Do not hand-code buttons, inputs, modals, tables, or other primitives from scratch. If a needed component is not yet in `components/ui/`, add it with `npx shadcn add <component>` first.

## After every file create or edit

Run the formatter so the file is saved in the correct format:

```bash
npm run format
```

## After formatting

Run lint and fix all errors before considering the task done:

```bash
npm run lint:fix
```

If errors remain after `lint:fix`, fix them manually — do not leave lint errors unresolved.
