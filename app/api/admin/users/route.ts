import { clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import { dayjs } from '~/lib/dayjs'
import { MASTERED_THRESHOLD } from '~/lib/mastery-scheduler'
import { STREAK_FACTOR } from '~/lib/score-config'
import { supabase } from '~/lib/supabase'

import type { ScoreBreakdown } from '~/lib/score-config'

export type { ScoreBreakdown }

export interface AdminUser {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  phone: string | null
  imageUrl: string
  username: string | null
  learnedCount: number
  masteredCount: number
  dueCount: number
  quizCount: number
  totalWords: number
  streakDays: number
  practicedToday: boolean
  score: number
  scoreBreakdown: ScoreBreakdown
  rank: number
  createdAt: number
  lastActiveAt: number | null
}

function calculateScore(
  masteredCount: number,
  currentStreak: number,
): { score: number; breakdown: ScoreBreakdown } {
  const multiplier = 1 + currentStreak * STREAK_FACTOR
  return {
    score: Math.round(masteredCount * multiplier),
    breakdown: { masteredCount, streakDays: currentStreak },
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    const clerk = await clerkClient()
    const { data: clerkUsers } = await clerk.users.getUserList({ limit: 500 })

    const today = dayjs().format('YYYY-MM-DD')
    const now = dayjs()

    const [progressResult, vocabResult, quizResult, streakResult] =
      await Promise.all([
        supabase.from('word_mastery').select('user_id, due_at, level'),
        supabase
          .from('vocabularies')
          .select('id', { count: 'exact', head: true }),
        supabase.from('quiz_sessions').select('user_id'),
        supabase
          .from('user_streaks')
          .select('user_id, current_streak, last_active_date'),
      ])

    const totalWords = vocabResult.count ?? 0

    const progressMap = new Map<
      string,
      { learnedCount: number; masteredCount: number; dueCount: number }
    >()
    for (const row of progressResult.data ?? []) {
      const existing = progressMap.get(row.user_id) ?? {
        learnedCount: 0,
        masteredCount: 0,
        dueCount: 0,
      }
      existing.learnedCount++
      if ((row.level ?? 0) >= MASTERED_THRESHOLD) existing.masteredCount++
      if (row.due_at && !dayjs(row.due_at).isAfter(now)) existing.dueCount++
      progressMap.set(row.user_id, existing)
    }

    const quizMap = new Map<string, number>()
    for (const row of quizResult.data ?? []) {
      quizMap.set(row.user_id, (quizMap.get(row.user_id) ?? 0) + 1)
    }

    const streakMap = new Map<
      string,
      { current_streak: number; last_active_date: string | null }
    >()
    for (const row of streakResult.data ?? []) {
      streakMap.set(row.user_id, {
        current_streak: row.current_streak ?? 0,
        last_active_date: row.last_active_date ?? null,
      })
    }

    const unsorted = clerkUsers.map((u) => {
      const stats = progressMap.get(u.id) ?? {
        learnedCount: 0,
        masteredCount: 0,
        dueCount: 0,
      }
      const streakData = streakMap.get(u.id) ?? {
        current_streak: 0,
        last_active_date: null,
      }
      const streakDays = streakData.current_streak
      const practicedToday = streakData.last_active_date === today
      const { score, breakdown } = calculateScore(
        stats.masteredCount,
        streakDays,
      )
      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.emailAddresses[0]?.emailAddress ?? '',
        phone: u.phoneNumbers[0]?.phoneNumber ?? null,
        imageUrl: u.imageUrl,
        username: u.username,
        learnedCount: stats.learnedCount,
        masteredCount: stats.masteredCount,
        dueCount: stats.dueCount,
        quizCount: quizMap.get(u.id) ?? 0,
        totalWords,
        streakDays,
        practicedToday,
        score,
        scoreBreakdown: breakdown,
        createdAt: u.createdAt,
        lastActiveAt: u.lastActiveAt,
      }
    })

    unsorted.sort(
      (a, b) =>
        b.score - a.score ||
        b.streakDays - a.streakDays ||
        b.masteredCount - a.masteredCount,
    )

    const ranked: AdminUser[] = unsorted.map((u, i) => ({ ...u, rank: i + 1 }))

    return NextResponse.json(ranked)
  } catch (error) {
    console.error('[admin/users]', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 },
    )
  }
}
