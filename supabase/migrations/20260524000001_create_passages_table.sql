create table passages (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  content text not null,
  translation text,
  summary text,
  time_good int,
  time_ok int,
  time_acceptable int,
  segments jsonb not null default '[]'::jsonb,
  word_tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.passages enable row level security;

create policy "authenticated_read" on public.passages
  for select to authenticated using (true);

create policy "authenticated_write" on public.passages
  for all to authenticated using (true) with check (true);

create index passages_user_id_idx on passages(user_id);
