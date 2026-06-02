alter table word_mastery
  add column if not exists max_level smallint not null default 0;

update word_mastery
  set max_level = greatest(max_level, level);
