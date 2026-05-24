alter table passages rename column user_id to created_by;

drop index passages_user_id_idx;
create index passages_created_by_idx on passages(created_by);

drop policy "authenticated_write" on passages;

create policy "creator_write" on passages
  for all to authenticated
  using (created_by = (auth.jwt() ->> 'sub'))
  with check (created_by = (auth.jwt() ->> 'sub'));
