alter table word_review_progress
  add column mastery_level smallint not null default 0 check (mastery_level between 0 and 5),
  add column test_correct_count integer not null default 0,
  add column test_wrong_count integer not null default 0,
  add column last_test_at timestamptz,
  add column next_test_due_at timestamptz;

create index word_review_progress_next_test_due_at_idx
  on word_review_progress (user_id, next_test_due_at);
