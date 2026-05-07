import { NextResponse } from 'next/server'

import { sendStreakReminder } from '~/lib/streak-email'
import { streakService } from '~/services/streak.service'

import type { UserStreak } from '~/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface LocalParts {
  date: string
  hour: number
}

function localPartsInTz(tz: string, now: Date): LocalParts | null {
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hour12: false,
    })
    const parts = fmt.formatToParts(now)
    const get = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? ''
    const hourRaw = get('hour')
    return {
      date: `${get('year')}-${get('month')}-${get('day')}`,
      hour: parseInt(hourRaw === '24' ? '0' : hourRaw, 10),
    }
  } catch {
    return null
  }
}

function shouldSend(row: UserStreak, now: Date): boolean {
  if (!row.email) return false
  const local = localPartsInTz(row.timezone, now)
  if (!local) return false
  if (local.hour !== row.reminder_hour) return false
  if (row.last_active_date === local.date) return false
  if (row.last_reminder_sent_at === local.date) return false
  return true
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

  const rows = await streakService.findEnabledReminderRows()
  const now = new Date()
  const results = { candidates: rows.length, sent: 0, skipped: 0, errors: 0 }

  for (const row of rows) {
    if (!shouldSend(row, now)) {
      results.skipped += 1
      continue
    }
    const local = localPartsInTz(row.timezone, now)
    if (!local) {
      results.skipped += 1
      continue
    }
    try {
      await sendStreakReminder({
        to: row.email!,
        currentStreak: row.current_streak,
        freezesRemaining: row.freezes_remaining,
        appUrl,
        fromAddress,
      })
      await streakService.markReminderSent(row.user_id, local.date)
      results.sent += 1
    } catch (err) {
      console.error('streak reminder send failed', row.user_id, err)
      results.errors += 1
    }
  }

  return NextResponse.json(results)
}
