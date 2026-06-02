drop index if exists word_mastery_relearning_idx;

alter table word_mastery
  drop column if exists ease_factor,
  drop column if exists stability,
  drop column if exists difficulty,
  drop column if exists is_relearning,
  drop column if exists relearning_step;
