create table story_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  session_date date not null default current_date,
  genre text not null,
  passage_text text not null,
  wrong_words jsonb not null default '[]',
  status text not null default 'active',
  created_at timestamptz default now(),
  unique (user_id, session_date)
);

alter table story_sessions enable row level security;

create policy "anon_all" on story_sessions
  for all to anon using (true) with check (true);

create table story_activity_progress (
  id uuid default gen_random_uuid() primary key,
  story_session_id uuid references story_sessions(id) on delete cascade not null,
  activity_type text not null,
  is_complete boolean not null default false,
  completed_at timestamptz,
  unique (story_session_id, activity_type)
);

alter table story_activity_progress enable row level security;

create policy "anon_all" on story_activity_progress
  for all to anon using (true) with check (true);
