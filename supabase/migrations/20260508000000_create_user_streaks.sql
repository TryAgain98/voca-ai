create table user_streaks (
  user_id text primary key,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_active_date date,
  freezes_remaining int not null default 2,
  freezes_replenished_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_streaks enable row level security;

create policy "anon_all" on user_streaks
  for all to anon using (true) with check (true);
