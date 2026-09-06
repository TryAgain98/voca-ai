-- 1. Reusable recurring task definitions (weekday / weekend / one-off special date)
create table task_templates (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  recurrence_kind text not null check (recurrence_kind in ('weekday', 'weekend', 'special_date')),
  special_date date,                             -- required iff recurrence_kind = 'special_date'
  plan_id uuid references plans(id) on delete set null,
  milestone_id uuid references plan_milestones(id) on delete set null,
  title text not null,
  note text,
  start_time time not null,
  end_time time not null,
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (end_time > start_time),
  check ((recurrence_kind = 'special_date') = (special_date is not null))
);
create index task_templates_user_kind_idx on task_templates (user_id, recurrence_kind);
create index task_templates_special_date_idx on task_templates (user_id, special_date)
  where recurrence_kind = 'special_date';

alter table task_templates enable row level security;
create policy "anon_all" on task_templates for all to anon using (true) with check (true);

-- 2. Idempotency guard — one row per (user, date) that has already been materialized,
-- so reopening a date never re-generates/duplicates tasks the user has since edited or deleted.
create table daily_task_generation_log (
  user_id text not null,
  task_date date not null,
  generated_at timestamptz default now(),
  primary key (user_id, task_date)
);

alter table daily_task_generation_log enable row level security;
create policy "anon_all" on daily_task_generation_log for all to anon using (true) with check (true);

-- 3. Link daily_tasks back to their origin so the Daily tab can group by recurrence type
alter table daily_tasks
  add column origin_template_id uuid references task_templates(id) on delete set null,
  add column origin_kind text not null default 'custom'
    check (origin_kind in ('weekday', 'weekend', 'special_date', 'custom')),
  add column needs_review boolean not null default false;
