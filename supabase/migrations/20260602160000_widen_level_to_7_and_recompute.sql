-- Drop the existing 0..5 CHECK on level (name carried over from the original
-- mastery_level column), regardless of its current name.
do $$
declare
  cname text;
begin
  select con.conname into cname
  from pg_constraint con
  join pg_attribute a
    on a.attrelid = con.conrelid and a.attnum = any (con.conkey)
  where con.conrelid = 'word_mastery'::regclass
    and con.contype = 'c'
    and a.attname = 'level';
  if cname is not null then
    execute format('alter table word_mastery drop constraint %I', cname);
  end if;
end $$;

-- Re-derive ladder level from net correct answers, now clamped to [0, 7]
update word_mastery
set level = least(7, greatest(0, correct_count - wrong_count)),
    max_level = least(7, greatest(0, correct_count - wrong_count));

alter table word_mastery
  add constraint word_mastery_level_check check (level between 0 and 7);
alter table word_mastery
  add constraint word_mastery_max_level_check check (max_level between 0 and 7);

-- Realign due date to the new ladder interval (days: 1,3,4,7,20,30,50,100)
update word_mastery
set due_at = tested_at + make_interval(days =>
      case level
        when 0 then 1
        when 1 then 3
        when 2 then 4
        when 3 then 7
        when 4 then 20
        when 5 then 30
        when 6 then 50
        else 100
      end)
where tested_at is not null;
