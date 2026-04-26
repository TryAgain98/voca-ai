create table vocabularies (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  word text not null,
  meaning text not null,
  example text
);

alter table public.vocabularies enable row level security;

create policy "authenticated_read" on public.vocabularies
  for select to authenticated using (true);

create policy "authenticated_write" on public.vocabularies
  for all to authenticated using (true) with check (true);
