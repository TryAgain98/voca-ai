alter table public.writing_exercises
  alter column is_public set default true;

update public.writing_exercises
  set is_public = true
  where is_public = false;
