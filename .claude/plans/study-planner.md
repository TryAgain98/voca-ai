# Spec: Study Planner (Long-term Plans + Daily Time-blocked Tasks + Email Reminders)

> Implementation spec. Follow it literally. All repo conventions below were verified against the
> current codebase — **do not re-explore to confirm them**.

## 1. Goal

1. **Long-term plan**: e.g. "In 3 months I can read & write a Golang app + English". Broken into
   measurable milestones ("finish 40 Go lessons", "learn 600 words").
2. **Daily plan**: hour-by-hour time blocks for a given day, optionally linked to a milestone.
3. **Checklist**: each block has **Start** and **Complete** actions.
4. **Reminders by email** (Resend, already installed):
   - Block start time passed + grace, still not started → "not started yet" email.
   - Block end time passed, still not completed → "not finished" email + auto-mark `missed`.
   - Each task sends **at most one email per kind**, ever.

Location: inside `/admin` (reuses `AdminShell`, Clerk guard, sidebar).

---

## 2. Verified repo conventions (obey these)

| Topic               | Convention                                                                                                                                                                                                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Imports             | `~/` root alias only. **Never** `../`, `@/`. Admin-internal: `~admin/...`                                                                                                                                                                                                   |
| Supabase client     | `import { supabase } from '~/lib/supabase'` (publishable key). **No service-role client needed** — see RLS below                                                                                                                                                            |
| RLS                 | Every table: `enable row level security` + policy `"anon_all" for all to anon using (true) with check (true)`. Auth is enforced app-side by Clerk. Copy `supabase/migrations/20260603120000_create_story_sessions.sql`                                                      |
| Services            | `services/{name}.service.ts`, `class X extends BaseService<Row, Insert, Update>`, export a singleton `export const xService = new XService()`. Ref: `services/lessons.service.ts`                                                                                           |
| Hooks               | `hooks/use-{name}.ts`, `'use client'`, TanStack Query v5, mutations invalidate + `toast.success/error` from `sonner`. Ref: `hooks/use-lessons.ts`                                                                                                                           |
| Types               | Plain interfaces exported from `types/index.ts` (barrel). Zod only for form validation. Follow the existing `WritingExercise` / `WritingExerciseInsert = Omit<...>` shape                                                                                                   |
| Pages               | `app/[locale]/admin/<feature>/page.tsx`, `'use client'` for interactive lists. Private parts in `_components/`, `_hooks/`, `_utils/`, `_types/`. Ref: `app/[locale]/admin/writing/page.tsx`                                                                                 |
| i18n                | `useTranslations('Namespace')` (client) / `getTranslations` (server). Update `messages/en.json` **and** `messages/vi.json` together. **Zero hardcoded strings in JSX**                                                                                                      |
| Date/time           | `import { dayjs, APP_TIMEZONE } from '~/lib/dayjs'` (`APP_TIMEZONE = 'Asia/Ho_Chi_Minh'`)                                                                                                                                                                                   |
| UI                  | shadcn only, from `components/ui/`. Available: button, card, dialog, input, select, native-select, switch, progress, badge, checkbox, table, tabs, empty, skeleton, alert-dialog, calendar, popover, sonner, separator                                                      |
| Colors              | **Never** hardcode colors in `style={}`. Use semantic tokens: `bg-card`, `bg-muted`, `border-border`, `text-foreground`, `text-muted-foreground`                                                                                                                            |
| Forms               | Plain `useState` for field state + a Zod schema validated with `schema.safeParse()` on submit. **Do not use `@conform-to`** — it is in `package.json` but has zero usage in the repo, so there is no reference pattern. Derive the value type with `z.infer<typeof schema>` |
| File size           | Max **200 lines**/file. Split into `_components/` when over                                                                                                                                                                                                                 |
| After every edit    | `npm run format && npm run lint:fix` — zero lint errors                                                                                                                                                                                                                     |
| After any migration | `npm run db:push`, then verify `npm run db:status`                                                                                                                                                                                                                          |
| No                  | `any`, `console.log`, `TODO` comments, commented-out code, array index as list `key`                                                                                                                                                                                        |

---

## 3. Migration

Create with `npm run db:new create_study_planner`, then fill:

```sql
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
```

Then run `npm run db:push` and `npm run db:status`.

---

## 4. Types — append to `types/index.ts`

```ts
export type PlanStatus = 'active' | 'done' | 'archived'
export type DailyTaskStatus = 'pending' | 'in_progress' | 'done' | 'missed'
export type TaskNotificationKind = 'not_started' | 'not_finished'

export interface Plan {
  id: string
  user_id: string
  title: string
  description: string | null
  start_date: string
  target_date: string
  status: PlanStatus
  created_at: string
  updated_at: string
}
export type PlanInsert = Omit<Plan, 'id' | 'created_at' | 'updated_at'>
export type PlanUpdate = Partial<Omit<PlanInsert, 'user_id'>>

export interface PlanMilestone {
  id: string
  plan_id: string
  title: string
  unit: string | null
  target_value: number
  current_value: number
  due_date: string | null
  sort_order: number
  created_at: string
}
export type PlanMilestoneInsert = Omit<PlanMilestone, 'id' | 'created_at'>
export type PlanMilestoneUpdate = Partial<Omit<PlanMilestoneInsert, 'plan_id'>>

export interface PlanWithMilestones extends Plan {
  milestones: PlanMilestone[]
}

export interface DailyTask {
  id: string
  user_id: string
  plan_id: string | null
  milestone_id: string | null
  task_date: string
  start_time: string // 'HH:mm:ss'
  end_time: string
  title: string
  note: string | null
  status: DailyTaskStatus
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}
export type DailyTaskInsert = Omit<
  DailyTask,
  'id' | 'created_at' | 'updated_at' | 'started_at' | 'completed_at' | 'status'
> & { status?: DailyTaskStatus }
export type DailyTaskUpdate = Partial<Omit<DailyTaskInsert, 'user_id'>>

export interface PlanReminderSettings {
  user_id: string
  email: string | null
  timezone: string
  grace_minutes: number
  is_enabled: boolean
  created_at: string
  updated_at: string
}
```

---

## 5. Files to create

### 5.1 `lib/local-time.ts` (~35 lines)

Extract & generalise the helper currently inlined in
`app/api/cron/streak-reminders/route.ts:17-38`.

```ts
export interface LocalParts {
  date: string // 'YYYY-MM-DD'
  minutesOfDay: number // 0..1439
}

export function localPartsInTz(tz: string, now: Date): LocalParts | null
export function timeToMinutes(time: string): number // 'HH:mm:ss' | 'HH:mm' -> minutes
export function minutesToTime(minutes: number): string // -> 'HH:mm'
```

`localPartsInTz` uses `Intl.DateTimeFormat('en-CA', { timeZone, year, month, day, hour, minute, hour12: false })`
and `formatToParts`; return `null` inside `catch` for an invalid tz. Handle the `hour === '24'` edge
case exactly as the existing code does.

### 5.2 `services/plans.service.ts` (~70 lines)

```ts
class PlansService extends BaseService<Plan, PlanInsert, PlanUpdate> {
  constructor() {
    super('plans')
  }
  findByUser(userId: string): Promise<Plan[]> // status != 'archived', order created_at desc
  findWithMilestones(planId: string): Promise<PlanWithMilestones> // select('*, milestones:plan_milestones(*)') ordered by sort_order
}
export const plansService = new PlansService()
```

### 5.3 `services/plan-milestones.service.ts` (~55 lines)

```ts
class PlanMilestonesService extends BaseService<
  PlanMilestone,
  PlanMilestoneInsert,
  PlanMilestoneUpdate
> {
  constructor() {
    super('plan_milestones')
  }
  findByPlan(planId: string): Promise<PlanMilestone[]>
  setProgress(id: string, currentValue: number): Promise<void> // clamp >= 0
}
```

### 5.4 `services/daily-tasks.service.ts` (~110 lines)

```ts
class DailyTasksService extends BaseService<
  DailyTask,
  DailyTaskInsert,
  DailyTaskUpdate
> {
  constructor() {
    super('daily_tasks')
  }

  findByDate(userId: string, date: string): Promise<DailyTask[]> // order start_time asc
  findDueForReminder(dates: string[]): Promise<DailyTask[]> // task_date in dates, status in ('pending','in_progress')
  findOverdueBefore(date: string): Promise<DailyTask[]> // task_date < date, status in ('pending','in_progress')

  markStarted(id: string): Promise<void> // status='in_progress', started_at=now
  markCompleted(id: string): Promise<void> // status='done',        completed_at=now
  markMissed(ids: string[]): Promise<void> // bulk .in('id', ids)
  reopen(id: string): Promise<void> // status='pending', started_at=null, completed_at=null

  copyFromDate(
    userId: string,
    sourceDate: string,
    targetDate: string,
  ): Promise<DailyTask[]>
  // reads sourceDate tasks, re-inserts with targetDate and status 'pending', started_at/completed_at null
}
```

### 5.5 `services/plan-reminders.service.ts` (~60 lines)

```ts
class PlanRemindersService {
  getSettings(userId: string): Promise<PlanReminderSettings | null>
  upsertSettings(
    payload: Partial<PlanReminderSettings> & { user_id: string },
  ): Promise<void>
  findEnabledSettings(): Promise<PlanReminderSettings[]> // is_enabled = true and email not null
  hasSent(taskId: string, kind: TaskNotificationKind): Promise<boolean>
  markSent(taskId: string, kind: TaskNotificationKind): Promise<boolean>
  // markSent inserts into task_notifications; on unique-violation (error.code === '23505') return false.
  // Callers MUST insert first and only send the email when it returns true — this is the anti-duplicate guard.
}
```

### 5.6 `lib/plan-task-email.ts` (~90 lines)

Model on `lib/streak-email.ts` — same Resend usage, same inline dark-email HTML skeleton
(`#0f1011` page, `#191a1b` card, `rgba(255,255,255,0.08)` border, `#5e6ad2` CTA, `#f7f8f8` heading,
`#d0d6e0` body, `#8a8f98` muted). Hardcoded colors are fine here — email clients have no theme system.

```ts
interface TaskReminderEmailParams {
  to: string
  kind: TaskNotificationKind
  tasks: Array<{ title: string; startTime: string; endTime: string }> // 'HH:mm'
  appUrl: string
  fromAddress: string
}
export async function sendTaskReminder(
  params: TaskReminderEmailParams,
): Promise<void>
```

- `not_started` → subject `"⏰ <n> task(s) should have started"`, CTA "Start now".
- `not_finished` → subject `"🔔 <n> task(s) are past their end time"`, CTA "Mark as done".
- CTA href: `${appUrl}/en/admin/today`.
- One email per user per kind per cron run, listing all matching tasks.

### 5.7 `app/api/cron/task-reminders/route.ts` (~120 lines)

Copy the auth + shape of `app/api/cron/streak-reminders/route.ts` exactly:
`export const dynamic = 'force-dynamic'`, `export const runtime = 'nodejs'`,
`GET`, 500 if `CRON_SECRET`/`REMINDER_FROM_EMAIL` missing, 401 unless
`authorization === 'Bearer ' + CRON_SECRET`. Return a JSON summary.

Algorithm:

```
settings = planRemindersService.findEnabledSettings()
now = new Date()
for each s in settings:
  local = localPartsInTz(s.timezone, now); if (!local) skip

  # A. sweep stale days first
  overdue = dailyTasksService.findOverdueBefore(local.date) filtered to s.user_id
  markMissed(overdue.ids)

  # B. today's open tasks
  tasks = dailyTasksService.findByDate(s.user_id, local.date)
          .filter(status === 'pending' || status === 'in_progress')

  notStarted = [], notFinished = []
  for t in tasks:
    endMin = timeToMinutes(t.end_time)
    startMin = timeToMinutes(t.start_time)
    if (local.minutesOfDay >= endMin) notFinished.push(t)        # end passed wins
    else if (t.status === 'pending' && local.minutesOfDay >= startMin + s.grace_minutes)
      notStarted.push(t)

  # C. claim-then-send (markSent returns false when already sent)
  for each bucket: keep only tasks where await markSent(t.id, kind) === true
  if bucket non-empty -> sendTaskReminder({ to: s.email, kind, tasks: bucket, ... })

  # D. tasks in notFinished become terminal
  markMissed(notFinished.ids)
```

Note: `markSent` before `sendTaskReminder`. A crashed send loses one email; the alternative
(send-then-mark) risks an infinite email loop every 5 minutes. Losing one is the correct trade.

Return `{ users, notStartedSent, notFinishedSent, missedSwept, errors }`.

### 5.8 Hooks

`hooks/use-plans.ts` (~90 lines) — `usePlans(userId)`, `usePlanWithMilestones(planId)`,
`useCreatePlan()`, `useUpdatePlan()`, `useDeletePlan()`.
Query keys: `['plans', userId]`, `['plan', planId]`.

`hooks/use-plan-milestones.ts` (~70 lines) — `useCreateMilestone()`, `useUpdateMilestone()`,
`useDeleteMilestone()`, `useSetMilestoneProgress()`. All invalidate `['plan', planId]`.

`hooks/use-daily-tasks.ts` (~130 lines) — `useDailyTasks(userId, date)`, `useCreateDailyTask()`,
`useUpdateDailyTask()`, `useDeleteDailyTask()`, `useStartTask()`, `useCompleteTask()`,
`useReopenTask()`, `useCopyTasksFromDate()`.
Query key `['daily-tasks', userId, date]`.
`useStartTask` / `useCompleteTask` **must be optimistic**: `onMutate` cancels the query, snapshots,
patches the row's `status`, `onError` rolls back, `onSettled` invalidates. No toast on success for
these two (the row UI already reflects it); toast only `onError`.

`hooks/use-plan-reminder-settings.ts` (~50 lines) — `usePlanReminderSettings(userId)`,
`useUpsertPlanReminderSettings()`.

### 5.9 Pages & components

```
app/[locale]/admin/plans/page.tsx                    (<=150)  list of plans + "New plan" dialog
app/[locale]/admin/plans/_components/plan-card.tsx   (<=110)  title, date range, days left, aggregate progress bar
app/[locale]/admin/plans/_components/plan-form-dialog.tsx (<=150) create/edit; useState + zod safeParse
app/[locale]/admin/plans/_components/plan-delete-dialog.tsx (<=70) alert-dialog; ref writing-delete-dialog.tsx
app/[locale]/admin/plans/[id]/page.tsx               (<=150)  plan header + milestone list
app/[locale]/admin/plans/[id]/_components/milestone-row.tsx (<=130) title, Progress bar, -/+ buttons, inline edit target
app/[locale]/admin/plans/[id]/_components/milestone-form-dialog.tsx (<=140)

app/[locale]/admin/today/page.tsx                    (<=170)  date picker, timeline, "Copy yesterday", "Add block"
app/[locale]/admin/today/_components/task-row.tsx    (<=140)  time range, title, milestone badge, status badge, Start/Done buttons
app/[locale]/admin/today/_components/task-form-dialog.tsx (<=160) time range, title, note, optional plan+milestone select
app/[locale]/admin/today/_utils/task-status.ts       (<=50)   isOverdue(task, nowMinutes), statusVariant(status)
```

Notes:

- `[id]` page: params is a Promise — `const { id } = await params` in a server wrapper, or use
  `useParams()` in the client page. Follow whichever `app/[locale]/admin/writing/[id]/` does.
- Get the user id via `const { user } = useUser()` from `@clerk/nextjs` (see
  `app/[locale]/admin/writing/page.tsx:27-28`).
- Plan aggregate progress = `sum(current_value) / sum(target_value)` across milestones, clamped 0–1.
- Task row states: `pending` → show **Start**; `in_progress` → show **Complete**; `done` →
  checkmark + Undo; `missed` → destructive badge + **Start** (late is better than never).
- Empty states + skeletons required, following `writing/page.tsx:72-91`.
- Mobile: card list under `md:hidden`, table at `md:table` — same as the writing page.

### 5.10 Settings

Add `app/[locale]/admin/settings/_components/plan-reminder-card.tsx` (<=150), placed next to
`streak-reminder-card.tsx` and rendered on the settings page. Fields: enable switch, email input,
timezone (native-select of a short const list incl. `Asia/Ho_Chi_Minh`, `UTC`), grace minutes
(native-select: 0/5/10/15/30).

### 5.11 Sidebar

In `components/layout/sidebar.tsx`, add to `navItems` after `dashboard`:

```ts
{ href: '/admin/plans', label: t('plans'), icon: Target },
{ href: '/admin/today', label: t('today'), icon: CalendarCheck },
```

Import `Target` and `CalendarCheck` from `lucide-react` (keep the import list alphabetised — ESLint
enforces import order).

### 5.12 i18n

Add `Nav.plans` / `Nav.today`, plus two namespaces to **both** `messages/en.json` and
`messages/vi.json`:

`Plans`: `title, description, new, empty, emptyHint, formTitle, formEdit, fieldTitle, fieldDescription,
fieldStartDate, fieldTargetDate, daysLeft, progress, milestones, newMilestone, milestoneEmpty,
fieldUnit, fieldTarget, fieldDueDate, deleteTitle, deleteBody, save, cancel, delete,
created, updated, deleted, saveFailed`

`Today`: `title, description, addBlock, copyYesterday, copied, empty, emptyHint, start, complete,
undo, statusPending, statusInProgress, statusDone, statusMissed, fieldTitle, fieldNote,
fieldStartTime, fieldEndTime, fieldPlan, fieldMilestone, noPlan, invalidRange, deleteTitle,
deleteBody, save, cancel, saveFailed`

`Settings`: add `planReminderTitle, planReminderDescription, planReminderEnable, planReminderEmail,
planReminderTimezone, planReminderGrace, planReminderSaved`

Vietnamese copy, not machine-literal English. E.g. `Today.title` → `"Hôm nay"`,
`Today.addBlock` → `"Thêm khung giờ"`, `Plans.title` → `"Kế hoạch"`, `Plans.daysLeft` → `"Còn {days} ngày"`.

---

## 6. Environment & cron trigger

### 6.1 Env vars — **currently missing from `.env.local`, must be added**

```
RESEND_API_KEY=...
REMINDER_FROM_EMAIL=Voca AI <reminders@yourdomain>
CRON_SECRET=<random 32+ chars>
NEXT_PUBLIC_APP_URL=https://...    # already present
```

None of these three exist in `.env.local` today, which means the existing streak-reminder cron has
never been able to run locally either. Add them to `.env.local` and to the Vercel project env.

### 6.2 Scheduling every 5 minutes

The repo has **no `vercel.json`**. Preferred trigger is Supabase `pg_cron` + `pg_net`, which is
minute-accurate and free.

Run this **manually in the Supabase SQL editor** — do **not** put it in a migration file, it embeds
the secret:

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'task-reminders',
  '*/5 * * * *',
  $$
  select net.http_get(
    url := 'https://YOUR_APP_URL/api/cron/task-reminders',
    headers := '{"Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb
  );
  $$
);
```

Alternative (needs Vercel Pro — Hobby caps cron at once/day): create `vercel.json` with
`{ "crons": [{ "path": "/api/cron/task-reminders", "schedule": "*/5 * * * *" }] }`.

---

## 7. Build order

1. Migration → `npm run db:push` → `npm run db:status`.
2. `types/index.ts`, `lib/local-time.ts`.
3. Services (5.2–5.5).
4. `lib/plan-task-email.ts` + cron route → verify with
   `curl -H "Authorization: Bearer $CRON_SECRET" localhost:3000/api/cron/task-reminders`.
5. Hooks.
6. i18n keys (before UI, so nothing is hardcoded).
7. Pages/components, sidebar, settings card.
8. `npm run format && npm run lint:fix && npm run build`.

Out of scope for this pass: AI-generated plans, recurring task templates, push notifications.
The notification channel lives entirely in `lib/plan-task-email.ts` — swapping to Telegram later
means replacing that one file.

---

## 8. Acceptance checklist

- [ ] `npm run db:status` shows the new migration as applied.
- [ ] Create a plan with 2 milestones; `+`/`-` updates the bar; aggregate progress on the card matches.
- [ ] Create a block for today 09:00–10:00; **Start** flips it to in-progress instantly (optimistic), **Complete** to done.
- [ ] With `grace_minutes = 0`, a `pending` block whose start time has passed produces exactly **one**
      `not_started` row in `task_notifications` and **one** email — hitting the cron URL 3× in a row
      sends nothing further.
- [ ] A block whose end time has passed and isn't done → `not_finished` email, and `status` becomes `missed`.
- [ ] A `done` block triggers no email of either kind.
- [ ] Blocks from a previous date left open are swept to `missed`.
- [ ] Cron returns 401 without the bearer token.
- [ ] `is_enabled = false` → zero emails.
- [ ] No hardcoded user-visible strings; both `en.json` and `vi.json` have every key.
- [ ] `npm run lint` clean; every new file ≤ 200 lines.
