import { clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import { supabase } from '~/lib/supabase'

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
  score: number
  rank: number
  createdAt: number
  lastActiveAt: number | null
}

function calculateScore(
  learnedCount: number,
  dueCount: number,
  totalWords: number,
): number {
  if (totalWords === 0) return 0
  const completionScore = (learnedCount / totalWords) * 60
  const disciplineScore =
    Math.max(0, 1 - dueCount / Math.max(learnedCount, 1)) * 40
  return Math.round(completionScore + disciplineScore)
}

export async function GET(): Promise<NextResponse> {
  try {
    const clerk = await clerkClient()
    const { data: clerkUsers } = await clerk.users.getUserList({ limit: 500 })

    const [progressResult, vocabResult, quizResult] = await Promise.all([
      supabase.from('word_mastery').select('user_id, due_at'),
      supabase
        .from('vocabularies')
        .select('id', { count: 'exact', head: true }),
      supabase.from('quiz_sessions').select('user_id'),
    ])

    const totalWords = vocabResult.count ?? 0
    const now = new Date()

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
      if (row.due_at && new Date(row.due_at) <= now) existing.dueCount++
      progressMap.set(row.user_id, existing)
    }

    const quizMap = new Map<string, number>()
    for (const row of quizResult.data ?? []) {
      quizMap.set(row.user_id, (quizMap.get(row.user_id) ?? 0) + 1)
    }

    const unsorted = clerkUsers.map((u) => {
      const stats = progressMap.get(u.id) ?? {
        learnedCount: 0,
        dueCount: 0,
      }
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
        score: calculateScore(stats.learnedCount, stats.dueCount, totalWords),
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
