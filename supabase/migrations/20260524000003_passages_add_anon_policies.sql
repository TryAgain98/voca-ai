create policy "anon_read" on public.passages
  for select to anon using (true);

create policy "anon_write" on public.passages
  for all to anon using (true) with check (true);

create policy "anon_read" on public.passage_sessions
  for select to anon using (true);

create policy "anon_write" on public.passage_sessions
  for all to anon using (true) with check (true);
