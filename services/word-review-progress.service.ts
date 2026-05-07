import {
  DEFAULTS,
  deriveGrade,
  isMastered,
  nextSchedule,
  retrievability,
} from '~/lib/mastery-scheduler'
import { supabase } from '~/lib/supabase'

import type { Grade } from '~/lib/mastery-scheduler'
import type { ReviewWord, WordReviewProgress } from '~/types'

export interface DashboardStats {
  totalWords: number
  learnedCount: number
  unlearnedCount: number
  dueTodayCount: number
  dueTodayWords: ReviewWord[]
  unlearnedWords: ReviewWord[]
  practicingCount: number
  masteredCount: number
  needsTestingCount: number
  needsTestingWords: ReviewWord[]
  relearningCount: number
  relearningWords: ReviewWord[]
  fadingCount: number
  fadingWords: ReviewWord[]
  averageRetention: number
}

const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30] as const
const NEEDS_TESTING_PREVIEW_LIMIT = 50
const FADING_PREVIEW_LIMIT = 20
const FADING_RETENTION_THRESHOLD = 0.85
const DAY_MS = 1000 * 60 * 60 * 24

export interface QuizWordResult {
  wordId: string
  isCorrect: boolean
  responseMs?: number
}

export interface QuizCandidatesResult {
  words: ReviewWord[]
  totalCandidates: number
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function daysBetween(a: Date, b: Date): number {
  return Math.max(0, (b.getTime() - a.getTime()) / DAY_MS)
}

function progressRetention(progress: WordReviewProgress, now: Date): number {
  if (!progress.last_test_at || progress.stability <= 0) return 1
  const elapsed = daysBetween(new Date(progress.last_test_at), now)
  return retrievability(progress.stability, elapsed)
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

function computeQuizPriority(
  progress: WordReviewProgress | null,
  now: Date,
): number {
  if (!progress) return -1
  if (progress.is_relearning && progress.next_test_due_at) {
    const due = new Date(progress.next_test_due_at)
    if (due > now) return -1
    return 100
  }
  if (!progress.last_test_at) {
    return 30 - progress.mastery_level * 2
  }
  if (!progress.next_test_due_at) return 35
  const dueDate = new Date(progress.next_test_due_at)
  const overdueDays = (now.getTime() - dueDate.getTime()) / DAY_MS
  if (dueDate <= now) {
    return 70 + Math.min(30, overdueDays * 4) - progress.mastery_level * 3
  }
  if (!isMastered(progress.mastery_level)) {
    const retention = progressRetention(progress, now)
    return 40 - progress.mastery_level * 4 + (1 - retention) * 30
  }
  return -1
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
        practicingCount: 0,
        masteredCount: 0,
        needsTestingCount: 0,
        needsTestingWords: [],
        relearningCount: 0,
        relearningWords: [],
        fadingCount: 0,
        fadingWords: [],
        averageRetention: 1,
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

    let masteredCount = 0
    let practicingCount = 0
    let needsTestingCount = 0
    let relearningCount = 0
    let fadingCount = 0
    let retentionSum = 0
    let retentionN = 0
    const needsTestingPriorityList: { word: ReviewWord; priority: number }[] =
      []
    const relearningList: ReviewWord[] = []
    const fadingPriorityList: { word: ReviewWord; retention: number }[] = []

    for (const vocab of vocabs) {
      const progress = progressMap.get(vocab.id)
      if (!progress) continue
      if (isMastered(progress.mastery_level)) {
        masteredCount += 1
      } else {
        practicingCount += 1
      }

      const reviewWord: ReviewWord = {
        ...vocab,
        progress,
        score: computeScore(progress),
      }

      if (progress.is_relearning) {
        relearningCount += 1
        relearningList.push(reviewWord)
      }

      const retention = progressRetention(progress, now)
      if (progress.last_test_at && progress.stability > 0) {
        retentionSum += retention
        retentionN += 1
      }
      if (
        retention < FADING_RETENTION_THRESHOLD &&
        isMastered(progress.mastery_level)
      ) {
        fadingCount += 1
        fadingPriorityList.push({ word: reviewWord, retention })
      }

      const priority = computeQuizPriority(progress, now)
      if (priority < 0) continue
      needsTestingCount += 1
      needsTestingPriorityList.push({ word: reviewWord, priority })
    }

    needsTestingPriorityList.sort((a, b) => b.priority - a.priority)
    fadingPriorityList.sort((a, b) => a.retention - b.retention)

    return {
      totalWords: vocabs.length,
      learnedCount,
      unlearnedCount: vocabs.length - learnedCount,
      dueTodayCount: dueTodayWords.length,
      dueTodayWords,
      unlearnedWords,
      practicingCount,
      masteredCount,
      needsTestingCount,
      needsTestingWords: needsTestingPriorityList
        .slice(0, NEEDS_TESTING_PREVIEW_LIMIT)
        .map((c) => c.word),
      relearningCount,
      relearningWords: relearningList.slice(0, FADING_PREVIEW_LIMIT),
      fadingCount,
      fadingWords: fadingPriorityList
        .slice(0, FADING_PREVIEW_LIMIT)
        .map((c) => c.word),
      averageRetention: retentionN > 0 ? retentionSum / retentionN : 1,
    }
  }

  async getQuizCandidates(
    userId: string,
    lessonIds: string[],
    limit: number = 20,
  ): Promise<QuizCandidatesResult> {
    let vocabQuery = supabase.from('vocabularies').select('*')
    if (lessonIds.length > 0) {
      vocabQuery = vocabQuery.in('lesson_id', lessonIds)
    }
    const { data: vocabs, error: vocabError } = await vocabQuery
    if (vocabError) throw vocabError
    if (!vocabs || vocabs.length === 0) {
      return { words: [], totalCandidates: 0 }
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

    const candidates: { word: ReviewWord; priority: number }[] = []
    for (const vocab of vocabs) {
      const progress = progressMap.get(vocab.id) ?? null
      const priority = computeQuizPriority(progress, now)
      if (priority < 0) continue
      candidates.push({
        word: { ...vocab, progress, score: computeScore(progress) },
        priority,
      })
    }

    candidates.sort((a, b) => b.priority - a.priority)

    return {
      words: candidates.slice(0, limit).map((c) => c.word),
      totalCandidates: candidates.length,
    }
  }

  async applyQuizMastery(
    userId: string,
    results: QuizWordResult[],
  ): Promise<void> {
    if (results.length === 0) return
    const now = new Date()
    const wordIds = results.map((r) => r.wordId)

    const { data: existing, error: fetchError } = await supabase
      .from('word_review_progress')
      .select('*')
      .eq('user_id', userId)
      .in('word_id', wordIds)

    if (fetchError) throw fetchError

    const existingMap = new Map<string, WordReviewProgress>(
      (existing ?? []).map((p: WordReviewProgress) => [p.word_id, p]),
    )

    const payload = results.map((r) => {
      const prev = existingMap.get(r.wordId)
      const grade: Grade = deriveGrade({
        isCorrect: r.isCorrect,
        responseMs: r.responseMs,
      })

      const schedule = nextSchedule({
        prevMastery: prev?.mastery_level ?? 0,
        prevEase: prev?.ease_factor ?? DEFAULTS.ease,
        prevStability: prev?.stability ?? DEFAULTS.stability,
        prevDifficulty: prev?.difficulty ?? DEFAULTS.difficulty,
        prevIsRelearning: prev?.is_relearning ?? false,
        prevRelearningStep: prev?.relearning_step ?? 0,
        grade,
        now,
      })

      return {
        user_id: userId,
        word_id: r.wordId,
        level: prev?.level ?? 0,
        correct_count: prev?.correct_count ?? 0,
        wrong_count: prev?.wrong_count ?? 0,
        last_review_at: prev?.last_review_at ?? null,
        next_review_at: prev?.next_review_at ?? now.toISOString(),
        mastery_level: schedule.mastery,
        test_correct_count:
          (prev?.test_correct_count ?? 0) + (r.isCorrect ? 1 : 0),
        test_wrong_count: (prev?.test_wrong_count ?? 0) + (r.isCorrect ? 0 : 1),
        last_test_at: now.toISOString(),
        next_test_due_at: schedule.dueAt.toISOString(),
        ease_factor: schedule.ease,
        stability: schedule.stability,
        difficulty: schedule.difficulty,
        lapse_count: (prev?.lapse_count ?? 0) + (schedule.isLapse ? 1 : 0),
        is_relearning: schedule.isRelearning,
        relearning_step: schedule.relearningStep,
        last_grade: grade,
        last_response_ms: r.responseMs ?? null,
        updated_at: now.toISOString(),
      }
    })

    const { error: upsertError } = await supabase
      .from('word_review_progress')
      .upsert(payload, { onConflict: 'user_id,word_id' })

    if (upsertError) throw upsertError
  }
}

export const wordReviewProgressService = new WordReviewProgressService()
