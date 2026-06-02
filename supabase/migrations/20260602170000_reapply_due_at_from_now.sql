-- Restart the review clock from today using the new ladder intervals,
-- so existing words re-enter the schedule cleanly (no overdue flood, no
-- midnight snapping). Days per level: 1,3,4,7,20,30,50,100.
update word_mastery
set due_at = now() + make_interval(days =>
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
