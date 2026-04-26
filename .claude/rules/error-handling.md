# Error Handling

## Principles

- Only validate at system boundaries (user input, external APIs, webhooks).
- Trust internal code and framework guarantees — don't add defensive checks for impossible states.
- Don't add error handling for scenarios that can't happen.

## Service Layer

Services throw errors directly. React Query catches and surfaces them:

```ts
async create(data: Insert): Promise<Row> {
  const { data: row, error } = await supabase.from(this.table).insert(data).select().single()
  if (error) throw new Error(error.message)
  return row
}
```

## React Query (Client)

Handle errors in `onError` callbacks with `toast`:

```ts
useMutation({
  mutationFn: ...,
  onSuccess: () => toast.success('Done'),
  onError: (err) => toast.error(err instanceof Error ? err.message : 'Something went wrong'),
})
```

## Server Components / Actions

Use Next.js error boundaries (`error.tsx`) for route-level errors.
Never swallow errors silently — always surface to the user or log.

## User-Facing Messages

- Success: `toast.success('...')`
- Error: `toast.error('...')` — use `sonner` (already installed)
- Keep messages concise and actionable.

## Form Validation

Use `@conform-to/react` + `@conform-to/zod` for server actions forms.
Always define Zod schemas in `lib/schemas/` and reuse across client and server.
