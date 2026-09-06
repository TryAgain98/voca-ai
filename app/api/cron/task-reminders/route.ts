import { NextResponse } from 'next/server'

import { localPartsInTz, timeToMinutes } from '~/lib/local-time'
import { sendTaskReminder } from '~/lib/plan-task-email'
import { dailyTasksService } from '~/services/daily-tasks.service'
import { planRemindersService } from '~/services/plan-reminders.service'

import type { DailyTask, TaskNotificationKind } from '~/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface CronSummary {
  users: number
  notStartedSent: number
  notFinishedSent: number
  missedSwept: number
  errors: number
}

async function claimAndSend(
  kind: TaskNotificationKind,
  tasks: DailyTask[],
  to: string,
  appUrl: string,
  fromAddress: string,
): Promise<number> {
  const claimed: DailyTask[] = []
  for (const task of tasks) {
    const isClaimed = await planRemindersService.markSent(task.id, kind)
    if (isClaimed) claimed.push(task)
  }
  if (claimed.length === 0) return 0

  await sendTaskReminder({
    to,
    kind,
    tasks: claimed.map((task) => ({
      title: task.title,
      startTime: task.start_time.slice(0, 5),
      endTime: task.end_time.slice(0, 5),
    })),
    appUrl,
    fromAddress,
  })
  return claimed.length
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const fromAddress = process.env.REMINDER_FROM_EMAIL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://voca.ai'

  if (!secret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 },
    )
  }
  if (!fromAddress) {
    return NextResponse.json(
      { error: 'REMINDER_FROM_EMAIL not configured' },
      { status: 500 },
    )
  }

  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const settings = await planRemindersService.findEnabledSettings()
  const now = new Date()
  const summary: CronSummary = {
    users: settings.length,
    notStartedSent: 0,
    notFinishedSent: 0,
    missedSwept: 0,
    errors: 0,
  }

  for (const s of settings) {
    const local = localPartsInTz(s.timezone, now)
    if (!local || !s.email) continue

    try {
      const overdue = (
        await dailyTasksService.findOverdueBefore(local.date)
      ).filter((task) => task.user_id === s.user_id)
      await dailyTasksService.markMissed(overdue.map((task) => task.id))
      summary.missedSwept += overdue.length

      const openTasks = (
        await dailyTasksService.findByDate(s.user_id, local.date)
      ).filter(
        (task) => task.status === 'pending' || task.status === 'in_progress',
      )

      const notStarted: DailyTask[] = []
      const notFinished: DailyTask[] = []
      for (const task of openTasks) {
        const endMin = timeToMinutes(task.end_time)
        const startMin = timeToMinutes(task.start_time)
        if (local.minutesOfDay >= endMin) {
          notFinished.push(task)
        } else if (
          task.status === 'pending' &&
          local.minutesOfDay >= startMin + s.grace_minutes
        ) {
          notStarted.push(task)
        }
      }

      summary.notStartedSent += await claimAndSend(
        'not_started',
        notStarted,
        s.email,
        appUrl,
        fromAddress,
      )
      summary.notFinishedSent += await claimAndSend(
        'not_finished',
        notFinished,
        s.email,
        appUrl,
        fromAddress,
      )

      await dailyTasksService.markMissed(notFinished.map((task) => task.id))
      summary.missedSwept += notFinished.length
    } catch (err) {
      console.error('task reminder cron failed', s.user_id, err)
      summary.errors += 1
    }
  }

  return NextResponse.json(summary)
}
