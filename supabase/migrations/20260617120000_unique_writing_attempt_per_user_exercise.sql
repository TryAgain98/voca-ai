-- Keep only the latest attempt per (exercise_id, user_id), delete the rest
delete from public.writing_attempts
where id not in (
  select distinct on (exercise_id, user_id) id
  from public.writing_attempts
  order by exercise_id, user_id, created_at desc
);

alter table public.writing_attempts
  add constraint writing_attempts_exercise_user_unique unique (exercise_id, user_id);
