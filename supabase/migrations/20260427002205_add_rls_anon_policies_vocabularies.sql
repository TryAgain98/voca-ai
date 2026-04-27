create policy "anon_read" on public.vocabularies
  for select to anon using (true);

create policy "anon_write" on public.vocabularies
  for all to anon using (true) with check (true);
