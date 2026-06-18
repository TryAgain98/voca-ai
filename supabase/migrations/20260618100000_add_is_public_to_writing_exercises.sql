alter table public.writing_exercises
  add column is_public boolean not null default false;

create index writing_exercises_is_public_idx on public.writing_exercises(is_public)
  where is_public = true;
