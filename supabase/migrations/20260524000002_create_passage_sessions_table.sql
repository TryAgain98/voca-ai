create table passage_sessions (
  id uuid primary key default gen_random_uuid(),
  passage_id uuid not null references passages(id) on delete cascade,
  user_id text not null,
  mode text not null check (mode in ('practice', 'exam')),
  transcript text,
  overall_score int,
  pronunciation_score int,
  fluency_score int,
  word_results jsonb not null default '[]'::jsonb,
  duration_seconds int,
  created_at timestamptz not null default now()
);

alter table public.passage_sessions enable row level security;

create policy "authenticated_read" on public.passage_sessions
  for select to authenticated using (true);

create policy "authenticated_write" on public.passage_sessions
  for all to authenticated using (true) with check (true);

create index passage_sessions_passage_id_idx on passage_sessions(passage_id);
create index passage_sessions_user_id_idx on passage_sessions(user_id);
