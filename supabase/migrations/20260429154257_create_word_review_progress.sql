create table word_review_progress (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  word_id uuid not null references vocabularies(id) on delete cascade,

  level smallint not null default 0 check (level between 0 and 5),
  correct_count integer not null default 0,
  wrong_count integer not null default 0,

  last_review_at timestamptz,
  next_review_at timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint word_review_progress_user_word_unique unique (user_id, word_id)
);

alter table word_review_progress enable row level security;

create policy "anon_all" on word_review_progress
  for all to anon using (true) with check (true);

create index word_review_progress_user_id_idx on word_review_progress (user_id);
create index word_review_progress_next_review_at_idx on word_review_progress (user_id, next_review_at);
