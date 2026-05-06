import { supabase } from '~/lib/supabase'

import type { ReviewWord, WordReviewProgress } from '~/types'

export interface DashboardStats {
  totalWords: number
  learnedCount: number
  unlearnedCount: number
  dueTodayCount: number
  dueTodayWords: ReviewWord[]
  unlearnedWords: ReviewWord[]
}

const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30] as const

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function computeScore(progress: WordReviewProgress | null): number {
  const now = new Date()
  const level = progress?.level ?? 0
  const isNew = !progress
  const isDue = progress ? new Date(progress.next_review_at) <= now : true
  const wrongCount = progress?.wrong_count ?? 0
  const correctCount = progress?.correct_count ?? 0
  const totalAttempts = wrongCount + correctCount
  const errorRate = totalAttempts > 0 ? wrongCount / totalAttempts : 0

  return (5 - level) * 2 + (isNew ? 3 : 0) + (isDue ? 5 : 0) + errorRate * 3
}

class WordReviewProgressService {
  async upsertAfterAnswer(
    userId: string,
    wordId: string,
    isCorrect: boolean,
  ): Promise<WordReviewProgress> {
    const now = new Date()

    const { data: existing } = await supabase
      .from('word_review_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .maybeSingle()

    const currentLevel = existing?.level ?? 0
    const newLevel = isCorrect
      ? Math.min(currentLevel + 1, 5)
      : Math.max(currentLevel - 1, 0)

    const intervalDays = isCorrect
      ? (REVIEW_INTERVALS_DAYS[newLevel - 1] ?? 1)
      : 1

    const payload = {
      user_id: userId,
      word_id: wordId,
      level: newLevel,
      correct_count: (existing?.correct_count ?? 0) + (isCorrect ? 1 : 0),
      wrong_count: (existing?.wrong_count ?? 0) + (isCorrect ? 0 : 1),
      last_review_at: now.toISOString(),
      next_review_at: addDays(now, intervalDays).toISOString(),
      updated_at: now.toISOString(),
    }

    const { data, error } = await supabase
      .from('word_review_progress')
      .upsert(payload, { onConflict: 'user_id,word_id' })
      .select()
      .single()

    if (error) throw error
    return data as WordReviewProgress
  }

  async getReviewWords(
    userId: string,
    lessonIds: string[],
    limit: number = 50,
  ): Promise<ReviewWord[]> {
    const { data: vocabs, error: vocabError } = await supabase
      .from('vocabularies')
      .select('*')
      .in('lesson_id', lessonIds)

    if (vocabError) throw vocabError
    if (!vocabs || vocabs.length === 0) return []

    const wordIds = vocabs.map((v) => v.id)

    const { data: progressRows, error: progressError } = await supabase
      .from('word_review_progress')
      .select('*')
      .eq('user_id', userId)
      .in('word_id', wordIds)

    if (progressError) throw progressError

    const progressMap = new Map<string, WordReviewProgress>(
      (progressRows ?? []).map((p: WordReviewProgress) => [p.word_id, p]),
    )

    const scored: ReviewWord[] = vocabs.map((vocab) => {
      const progress = progressMap.get(vocab.id) ?? null
      return { ...vocab, progress, score: computeScore(progress) }
    })

    scored.sort((a, b) => b.score - a.score)

    return scored.slice(0, limit)
  }

  async getDashboardStats(userId: string): Promise<DashboardStats> {
    const { data: vocabs, error: vocabError } = await supabase
      .from('vocabularies')
      .select('*')

    if (vocabError) throw vocabError
    if (!vocabs || vocabs.length === 0) {
      return {
        totalWords: 0,
        learnedCount: 0,
        unlearnedCount: 0,
        dueTodayCount: 0,
        dueTodayWords: [],
        unlearnedWords: [],
      }
    }

    const wordIds = vocabs.map((v) => v.id)

    const { data: progressRows, error: progressError } = await supabase
      .from('word_review_progress')
      .select('*')
      .eq('user_id', userId)
      .in('word_id', wordIds)

    if (progressError) throw progressError

    const progressMap = new Map<string, WordReviewProgress>(
      (progressRows ?? []).map((p: WordReviewProgress) => [p.word_id, p]),
    )

    const now = new Date()
    const learnedCount = progressRows?.length ?? 0

    const unlearnedWords: ReviewWord[] = vocabs
      .filter((v) => !progressMap.has(v.id))
      .map((v) => ({ ...v, progress: null, score: computeScore(null) }))

    const dueTodayWords: ReviewWord[] = vocabs
      .filter((v) => {
        const progress = progressMap.get(v.id)
        return progress && new Date(progress.next_review_at) <= now
      })
      .map((v) => {
        const progress = progressMap.get(v.id) ?? null
        return { ...v, progress, score: computeScore(progress) }
      })

    return {
      totalWords: vocabs.length,
      learnedCount,
      unlearnedCount: vocabs.length - learnedCount,
      dueTodayCount: dueTodayWords.length,
      dueTodayWords,
      unlearnedWords,
    }
  }
}

export const wordReviewProgressService = new WordReviewProgressService()
