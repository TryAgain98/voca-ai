import { supabase } from '~/lib/supabase'

import type { StreakReminderPrefs, UserStreak } from '~/types'

const FREEZE_CAP = 2
const FREEZE_REPLENISH_DAYS = 7
const MS_PER_DAY = 1000 * 60 * 60 * 24

function todayLocalDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T00:00:00`).getTime()
  const to = new Date(`${toIso}T00:00:00`).getTime()
  return Math.round((to - from) / MS_PER_DAY)
}

interface NextStreakState {
  current_streak: number
  longest_streak: number
  last_active_date: string
  freezes_remaining: number
  freezes_replenished_at: string
}

function computeNextState(
  existing: UserStreak | null,
  today: string,
): NextStreakState | null {
  if (!existing) {
    return {
      current_streak: 1,
      longest_streak: 1,
      last_active_date: today,
      freezes_remaining: FREEZE_CAP,
      freezes_replenished_at: today,
    }
  }

  const sinceReplenish = daysBetween(existing.freezes_replenished_at, today)
  const shouldReplenish = sinceReplenish >= FREEZE_REPLENISH_DAYS
  const freezes = shouldReplenish ? FREEZE_CAP : existing.freezes_remaining
  const replenishedAt = shouldReplenish
    ? today
    : existing.freezes_replenished_at

  if (existing.last_active_date === today) {
    if (!shouldReplenish) return null
    return {
      current_streak: existing.current_streak,
      longest_streak: existing.longest_streak,
      last_active_date: today,
      freezes_remaining: freezes,
      freezes_replenished_at: replenishedAt,
    }
  }

  const daysSince = existing.last_active_date
    ? daysBetween(existing.last_active_date, today)
    : Infinity

  let nextStreak: number
  let remainingFreezes = freezes

  if (daysSince === 1) {
    nextStreak = existing.current_streak + 1
  } else if (daysSince > 1 && Number.isFinite(daysSince)) {
    const missed = daysSince - 1
    if (missed <= remainingFreezes) {
      remainingFreezes -= missed
      nextStreak = existing.current_streak + 1
    } else {
      nextStreak = 1
    }
  } else {
    nextStreak = 1
  }

  return {
    current_streak: nextStreak,
    longest_streak: Math.max(existing.longest_streak, nextStreak),
    last_active_date: today,
    freezes_remaining: remainingFreezes,
    freezes_replenished_at: replenishedAt,
  }
}

class StreakService {
  async findByUserId(userId: string): Promise<UserStreak | null> {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    return data as UserStreak | null
  }

  async recordActivity(userId: string): Promise<UserStreak> {
    const today = todayLocalDate()
    const existing = await this.findByUserId(userId)
    const next = computeNextState(existing, today)

    if (!next) return existing as UserStreak

    const { data, error } = await supabase
      .from('user_streaks')
      .upsert(
        { user_id: userId, ...next, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      )
      .select()
      .single()
    if (error) throw error
    return data as UserStreak
  }

  async upsertReminderPrefs(
    userId: string,
    prefs: StreakReminderPrefs,
  ): Promise<UserStreak> {
    const { data, error } = await supabase
      .from('user_streaks')
      .upsert(
        {
          user_id: userId,
          email: prefs.email,
          timezone: prefs.timezone,
          reminder_hour: prefs.reminder_hour,
          email_reminders_enabled: prefs.email_reminders_enabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
      .select()
      .single()
    if (error) throw error
    return data as UserStreak
  }

  async findEnabledReminderRows(): Promise<UserStreak[]> {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('email_reminders_enabled', true)
      .not('email', 'is', null)
      .gte('current_streak', 1)
    if (error) throw error
    return (data ?? []) as UserStreak[]
  }

  async markReminderSent(userId: string, dateIso: string): Promise<void> {
    const { error } = await supabase
      .from('user_streaks')
      .update({ last_reminder_sent_at: dateIso })
      .eq('user_id', userId)
    if (error) throw error
  }
}

export const streakService = new StreakService()
export { computeNextState, todayLocalDate }
