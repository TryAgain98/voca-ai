# API Conventions

## Service Layer

Every Supabase table gets its own service extending `BaseService`:

```ts
// services/example.service.ts
import type { Example } from '~/types'
import { BaseService } from './base.service'

type ExampleInsert = { name: string; description?: string }
type ExampleUpdate = Partial<ExampleInsert>

class ExampleService extends BaseService<
  Example,
  ExampleInsert,
  ExampleUpdate
> {
  constructor() {
    super('examples')
  }

  // Table-specific methods go here
  async findBySlug(slug: string): Promise<Example> {
    // ...
  }
}

export const exampleService = new ExampleService()
```

- Export a **singleton instance**, not the class.
- Services throw errors directly — React Query catches them.
- No React, no hooks inside services.

## React Query Hooks

One file per resource: `hooks/use-{resource}.ts`

```ts
// hooks/use-lessons.ts
export function useLessons() { ... }
export function useCreateLesson() { ... }
export function useUpdateLesson() { ... }
export function useDeleteLesson() { ... }
```

- Query keys: simple array `['lessons']` or `['lessons', id]`
- Mutations **always** invalidate + call `toast`:

```ts
export function useCreateLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: LessonInsert) => lessonsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lessons'] })
      toast.success('Lesson created')
    },
    onError: () => toast.error('Failed to create lesson'),
  })
}
```

## Next.js API Routes

- Place under `app/api/` for server-only endpoints (webhooks, etc.)
- Use `NextResponse.json()` with proper HTTP status codes.
- Validate input with Zod at the boundary.
- Never expose Supabase service role key to the client.
