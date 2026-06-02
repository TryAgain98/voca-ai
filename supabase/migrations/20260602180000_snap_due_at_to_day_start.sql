-- Day-based scheduling: add the ladder interval then snap to the start of that
-- day (Asia/Ho_Chi_Minh), so a word is due for the whole day and can be
-- reviewed any time. Days per level: 1,3,4,7,20,30,50,100.
update word_mastery
set due_at = date_trunc(
      'day',
      (now() + make_interval(days =>
        case level
          when 0 then 1
          when 1 then 3
          when 2 then 4
          when 3 then 7
          when 4 then 20
          when 5 then 30
          when 6 then 50
          else 100
        end)) at time zone 'Asia/Ho_Chi_Minh'
    ) at time zone 'Asia/Ho_Chi_Minh'
where tested_at is not null;
