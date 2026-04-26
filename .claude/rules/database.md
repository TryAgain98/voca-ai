# Database (Supabase)

## Migrations

- Every schema change = new migration file. **Never edit an already-pushed migration.**
- Create: `npm run db:new -- <name>`
- Apply: `npm run db:push`
- Check status: `npm run db:status`
- Pull remote: `npm run db:pull`

## Migration Naming

Use descriptive snake_case names:

```bash
npm run db:new -- create_lessons_table
npm run db:new -- add_user_id_to_sessions
npm run db:new -- add_rls_policies_lessons
```

## SQL Patterns (see supabase/GUIDE.md)

Always enable RLS on new tables:

```sql
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
```

Standard RLS policies:

```sql
-- Authenticated users can read all
CREATE POLICY "authenticated_read" ON public.lessons
  FOR SELECT TO authenticated USING (true);

-- Users can only modify their own rows
CREATE POLICY "owner_write" ON public.lessons
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## Supabase Client

Import from `~/lib/supabase` — never create inline clients:

```ts
import { supabase } from '~/lib/supabase'
```

## Type Safety

Generate types from the database schema — use them in services:

```ts
import type { Database } from '~/types/supabase'
type Lesson = Database['public']['Tables']['lessons']['Row']
```
