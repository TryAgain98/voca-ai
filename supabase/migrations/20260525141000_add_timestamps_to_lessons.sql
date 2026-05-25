alter table lessons
  add column created_at timestamptz,
  add column updated_at timestamptz not null default now();

update lessons
set created_at = coalesce(
  (
    select min(vocabularies.created_at)
    from vocabularies
    where vocabularies.lesson_id = lessons.id
  ),
  now()
)
where created_at is null;

alter table lessons
  alter column created_at set default now(),
  alter column created_at set not null;

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger lessons_set_updated_at
  before update on lessons
  for each row execute procedure set_updated_at();

create index lessons_created_at_idx on lessons (created_at desc);
