import { clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import { dayjs } from '~/lib/dayjs'
import { SCORE_MAX, STREAK_CAP } from '~/lib/score-config'
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
  dueCount: number
  quizCount: number
  totalWords: number
  streakDays: number
  score: number
  scoreBreakdown: ScoreBreakdown
  rank: number
  createdAt: number
  lastActiveAt: number | null
}

function calculateScore(
  learnedCount: number,
  dueCount: number,
  totalWords: number,
  currentStreak: number,
): { score: number; breakdown: ScoreBreakdown } {
  if (totalWords === 0) {
    return { score: 0, breakdown: { completion: 0, discipline: 0, streak: 0 } }
  }
  const completion = Math.round(
    (learnedCount / totalWords) * SCORE_MAX.completion,
  )
  const discipline =
    learnedCount === 0
      ? 0
      : Math.round(
          Math.max(0, 1 - dueCount / learnedCount) * SCORE_MAX.discipline,
        )
  const streak = Math.round(
    (Math.min(currentStreak, STREAK_CAP) / STREAK_CAP) * SCORE_MAX.streak,
  )
  return {
    score: completion + discipline + streak,
    breakdown: { completion, discipline, streak },
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    const clerk = await clerkClient()
    const { data: clerkUsers } = await clerk.users.getUserList({ limit: 500 })

    const [progressResult, vocabResult, quizResult, streakResult] =
      await Promise.all([
        supabase.from('word_mastery').select('user_id, due_at'),
        supabase
          .from('vocabularies')
          .select('id', { count: 'exact', head: true }),
        supabase.from('quiz_sessions').select('user_id'),
        supabase.from('user_streaks').select('user_id, current_streak'),
      ])

    const totalWords = vocabResult.count ?? 0
    const now = dayjs()

    const progressMap = new Map<
      string,
      { learnedCount: number; dueCount: number }
    >()
    for (const row of progressResult.data ?? []) {
      const existing = progressMap.get(row.user_id) ?? {
        learnedCount: 0,
        dueCount: 0,
      }
      existing.learnedCount++
      if (row.due_at && !dayjs(row.due_at).isAfter(now)) existing.dueCount++
      progressMap.set(row.user_id, existing)
    }

    const quizMap = new Map<string, number>()
    for (const row of quizResult.data ?? []) {
      quizMap.set(row.user_id, (quizMap.get(row.user_id) ?? 0) + 1)
    }

    const streakMap = new Map<string, number>()
    for (const row of streakResult.data ?? []) {
      streakMap.set(row.user_id, row.current_streak ?? 0)
    }

    const unsorted = clerkUsers.map((u) => {
      const stats = progressMap.get(u.id) ?? {
        learnedCount: 0,
        dueCount: 0,
      }
      const streakDays = streakMap.get(u.id) ?? 0
      const { score, breakdown } = calculateScore(
        stats.learnedCount,
        stats.dueCount,
        totalWords,
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
        dueCount: stats.dueCount,
        quizCount: quizMap.get(u.id) ?? 0,
        totalWords,
        streakDays,
        score,
        scoreBreakdown: breakdown,
        createdAt: u.createdAt,
        lastActiveAt: u.lastActiveAt,
      }
    })

    unsorted.sort(
      (a, b) => b.score - a.score || b.learnedCount - a.learnedCount,
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
