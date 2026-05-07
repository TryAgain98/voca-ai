alter table word_review_progress
  add column ease_factor numeric(4, 2) not null default 2.50 check (ease_factor between 1.30 and 3.00),
  add column stability numeric(8, 2) not null default 0,
  add column difficulty numeric(4, 2) not null default 5.00 check (difficulty between 1.00 and 10.00),
  add column lapse_count integer not null default 0,
  add column is_relearning boolean not null default false,
  add column relearning_step smallint not null default 0,
  add column last_grade smallint check (last_grade between 1 and 4),
  add column last_response_ms integer;

create index word_review_progress_relearning_idx
  on word_review_progress (user_id, is_relearning, next_test_due_at)
  where is_relearning = true;
