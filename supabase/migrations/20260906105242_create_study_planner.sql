-- 1. Long-term plan
create table plans (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  title text not null,
  description text,
  start_date date not null default current_date,
  target_date date not null,
  status text not null default 'active',        -- active | done | archived
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index plans_user_idx on plans (user_id, status);

alter table plans enable row level security;
create policy "anon_all" on plans for all to anon using (true) with check (true);

-- 2. Measurable milestone inside a plan
create table plan_milestones (
  id uuid default gen_random_uuid() primary key,
  plan_id uuid references plans(id) on delete cascade not null,
  title text not null,
  unit text,                                     -- "lessons", "words", "chapters"
  target_value int not null default 1 check (target_value > 0),
  current_value int not null default 0 check (current_value >= 0),
  due_date date,
  sort_order int not null default 0,
  created_at timestamptz default now()
);
create index plan_milestones_plan_idx on plan_milestones (plan_id, sort_order);

alter table plan_milestones enable row level security;
create policy "anon_all" on plan_milestones for all to anon using (true) with check (true);

-- 3. Daily time block
create table daily_tasks (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  plan_id uuid references plans(id) on delete set null,
  milestone_id uuid references plan_milestones(id) on delete set null,
  task_date date not null,
  start_time time not null,
  end_time time not null,
  title text not null,
  note text,
  status text not null default 'pending',        -- pending | in_progress | done | missed
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (end_time > start_time)                  -- no cross-midnight blocks
);
create index daily_tasks_user_date_idx on daily_tasks (user_id, task_date);
create index daily_tasks_dispatch_idx on daily_tasks (task_date, status)
  where status in ('pending', 'in_progress');

alter table daily_tasks enable row level security;
create policy "anon_all" on daily_tasks for all to anon using (true) with check (true);

-- 4. Sent-reminder log — the unique constraint is what prevents duplicate emails
create table task_notifications (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references daily_tasks(id) on delete cascade not null,
  kind text not null,                            -- not_started | not_finished
  sent_at timestamptz default now(),
  unique (task_id, kind)
);

alter table task_notifications enable row level security;
create policy "anon_all" on task_notifications for all to anon using (true) with check (true);

-- 5. Per-user reminder settings (self-contained; do NOT couple to user_streaks)
create table plan_reminder_settings (
  user_id text primary key,
  email text,
  timezone text not null default 'Asia/Ho_Chi_Minh',
  grace_minutes int not null default 5 check (grace_minutes between 0 and 120),
  is_enabled boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index plan_reminder_settings_enabled_idx on plan_reminder_settings (is_enabled)
  where is_enabled = true;

alter table plan_reminder_settings enable row level security;
create policy "anon_all" on plan_reminder_settings for all to anon using (true) with check (true);
