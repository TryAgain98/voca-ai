-- Reset existing word_mastery.due_at to start-of-day in the app timezone so
-- review times are predictable. Aligned with the scheduler, which now snaps
-- next due timestamps to the start of the target day in Asia/Ho_Chi_Minh.

update word_mastery
set due_at = date_trunc('day', due_at at time zone 'Asia/Ho_Chi_Minh')
             at time zone 'Asia/Ho_Chi_Minh'
where due_at is not null
  and due_at <> date_trunc('day', due_at at time zone 'Asia/Ho_Chi_Minh')
                at time zone 'Asia/Ho_Chi_Minh';
