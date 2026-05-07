alter table user_streaks
  add column email text,
  add column timezone text not null default 'UTC',
  add column reminder_hour int not null default 20,
  add column email_reminders_enabled boolean not null default false,
  add column last_reminder_sent_at date;

create index user_streaks_reminder_dispatch_idx
  on user_streaks (timezone, reminder_hour)
  where email_reminders_enabled = true;
