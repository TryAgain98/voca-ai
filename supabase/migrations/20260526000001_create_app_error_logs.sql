create table app_error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  source text not null,
  action text not null,
  message text not null,
  name text,
  stack text,
  details jsonb not null default '{}',
  url text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table app_error_logs enable row level security;

create policy "anon_insert" on app_error_logs
  for insert to anon with check (true);

create index app_error_logs_created_at_idx
  on app_error_logs (created_at desc);

create index app_error_logs_source_created_at_idx
  on app_error_logs (source, created_at desc);

create index app_error_logs_user_id_created_at_idx
  on app_error_logs (user_id, created_at desc);
