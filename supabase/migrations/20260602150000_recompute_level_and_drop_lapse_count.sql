-- Re-derive ladder level from net correct answers, clamped to [0, 5]
update word_mastery
set level = least(5, greatest(0, correct_count - wrong_count)),
    max_level = least(5, greatest(0, correct_count - wrong_count));

-- Realign due date to the new ladder interval (days per level: 1,3,8,20,50,125)
update word_mastery
set due_at = tested_at + make_interval(days =>
      case level
        when 0 then 1
        when 1 then 3
        when 2 then 8
        when 3 then 20
        when 4 then 50
        else 125
      end)
where tested_at is not null;

-- lapse_count is display-only and no longer needed
alter table word_mastery
  drop column if exists lapse_count;
