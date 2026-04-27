alter table public.lessons enable row level security;

create policy "anon_read" on public.lessons
  for select to anon using (true);

create policy "anon_write" on public.lessons
  for all to anon using (true) with check (true);
