-- Refocus the table on test-driven mastery only. Review (flashcard) is now
-- a read-only practice surface with no DB writes.

drop index if exists word_review_progress_next_review_at_idx;

alter table word_review_progress
  drop column level,
  drop column correct_count,
  drop column wrong_count,
  drop column last_review_at,
  drop column next_review_at;

alter table word_review_progress rename column mastery_level to level;
alter table word_review_progress rename column test_correct_count to correct_count;
alter table word_review_progress rename column test_wrong_count to wrong_count;
alter table word_review_progress rename column last_test_at to tested_at;
alter table word_review_progress rename column next_test_due_at to due_at;

alter index word_review_progress_pkey rename to word_mastery_pkey;
alter index word_review_progress_user_id_idx rename to word_mastery_user_id_idx;
alter index word_review_progress_next_test_due_at_idx rename to word_mastery_due_at_idx;
alter index word_review_progress_relearning_idx rename to word_mastery_relearning_idx;

alter table word_review_progress
  rename constraint word_review_progress_user_word_unique
  to word_mastery_user_word_unique;

alter table word_review_progress rename to word_mastery;
