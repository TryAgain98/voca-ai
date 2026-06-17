create table public.writing_exercises (
  id uuid primary key default gen_random_uuid(),
  created_by text not null,
  title text not null,
  image_url text not null,
  keywords text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.writing_exercises enable row level security;

create policy "anon_read" on public.writing_exercises
  for select to anon using (true);

create policy "anon_write" on public.writing_exercises
  for all to anon using (true) with check (true);

create index writing_exercises_created_by_idx on public.writing_exercises(created_by);

create table public.writing_attempts (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.writing_exercises(id) on delete cascade,
  user_id text not null,
  user_sentence text not null,
  grammar_score int not null,
  relevance_score int not null,
  grammar_feedback text not null,
  relevance_feedback text not null,
  improved_sentence text not null,
  ideal_sentence text not null,
  created_at timestamptz not null default now()
);

alter table public.writing_attempts enable row level security;

create policy "anon_read" on public.writing_attempts
  for select to anon using (true);

create policy "anon_write" on public.writing_attempts
  for all to anon using (true) with check (true);

create index writing_attempts_exercise_id_idx on public.writing_attempts(exercise_id);
create index writing_attempts_user_id_idx on public.writing_attempts(user_id);

insert into storage.buckets (id, name, public)
values ('writing-images', 'writing-images', true)
on conflict (id) do nothing;

create policy "public_read_writing_images" on storage.objects
  for select using (bucket_id = 'writing-images');

create policy "anon_upload_writing_images" on storage.objects
  for insert to anon with check (bucket_id = 'writing-images');

create policy "anon_delete_writing_images" on storage.objects
  for delete to anon using (bucket_id = 'writing-images');
