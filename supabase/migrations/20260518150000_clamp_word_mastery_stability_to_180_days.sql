-- Cap runaway stability values produced by the previous scheduler, which
-- compounded ease twice and allowed exponential growth (some rows reached
-- thousands of days, scheduling reviews decades into the future). Clamp
-- stability to MAX_STABILITY_DAYS = 180 and pull due_at back in line.

update word_mastery
set
  stability = least(stability, 180),
  due_at = least(
    due_at,
    date_trunc(
      'day',
      (coalesce(tested_at, now()) + interval '180 days') at time zone 'Asia/Ho_Chi_Minh'
    ) at time zone 'Asia/Ho_Chi_Minh'
  )
where stability > 180;
