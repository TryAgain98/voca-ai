create table quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  lesson_ids text[] not null default '{}',
  start_time timestamptz not null,
  end_time timestamptz not null,
  total_questions int not null default 0,
  correct_count int not null default 0,
  score float not null default 0,
  incorrect_words jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table quiz_sessions enable row level security;

create policy "anon_all" on quiz_sessions
  for all to anon using (true) with check (true);

create index quiz_sessions_user_id_idx on quiz_sessions (user_id);
create index quiz_sessions_created_at_idx on quiz_sessions (user_id, created_at desc);
