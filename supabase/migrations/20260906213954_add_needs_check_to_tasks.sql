-- Not every block needs a Start/Complete checklist (e.g. meals, commute).
-- Tasks with needs_check = false are informational only and are excluded
-- from dashboard progress, the missed-task sweep, and reminder emails.
alter table task_templates add column needs_check boolean not null default true;
alter table daily_tasks add column needs_check boolean not null default true;
