import { APP_TIMEZONE, dayjs } from '~/lib/dayjs'
import {
  DEFAULTS,
  deriveGrade,
  GRADE_AGAIN,
  isMastered,
  MASTERED_THRESHOLD,
  nextSchedule,
  retrievability,
} from '~/lib/mastery-scheduler'
import { supabase } from '~/lib/supabase'

import type { Grade } from '~/lib/mastery-scheduler'
import type { ReviewWord, WordMastery } from '~/types'

export interface DashboardStats {
  totalWords: number
  learnedCount: number
  unlearnedCount: number
  unlearnedWords: ReviewWord[]
  practicingCount: number
  practicingWords: ReviewWord[]
  masteredCount: number
  masteredWords: ReviewWord[]
  needsTestingCount: number
  needsTestingWords: ReviewWord[]
  fadingCount: number
  fadingWords: ReviewWord[]
  wrongTodayCount: number
  wrongTodayWords: ReviewWord[]
  averageRetention: number
}

const NEEDS_TESTING_PREVIEW_LIMIT = 50
const FADING_PREVIEW_LIMIT = 20
const WRONG_TODAY_PREVIEW_LIMIT = 20
const FADING_RETENTION_THRESHOLD = 0.85
const RECENT_TEST_COOLDOWN_MS = 60 * 60 * 1000
const UNTESTED_PRIORITY = 50

export interface QuizWordResult {
  wordId: string
  word?: string
  isCorrect: boolean
  responseMs?: number
  usedHint?: boolean
}

export interface QuizCandidatesResult {
  words: ReviewWord[]
  totalCandidates: number
}

export interface ForecastDayBreakdown {
  practicing: number
}

export interface ForecastDay {
  date: string
  count: number
  breakdown: ForecastDayBreakdown
}

export interface ReviewForecast {
  todayCount: number
  nextFutureDate: string | null
  nextFutureCount: number
  daysUntilNextFuture: number | null
  overdueCount: number
  totalUpcoming: number
  forecast: ForecastDay[]
}

const FORECAST_DAYS = 14

function daysBetween(a: Date, b: Date): number {
  return Math.max(0, dayjs(b).diff(dayjs(a), 'day'))
}

function progressRetention(progress: WordMastery, now: Date): number {
  if (!progress.tested_at || progress.stability <= 0) return 1
  const elapsed = daysBetween(dayjs(progress.tested_at).toDate(), now)
  return retrievability(progress.stability, elapsed)
}

function computePracticeScore(progress: WordMastery | null): number {
  if (!progress) return 100
  const retention = progressRetention(progress, dayjs().toDate())
  const masteryGap = (5 - progress.level) * 8
  const difficultyBoost = (progress.difficulty - 5) * 4
  return masteryGap + difficultyBoost + (1 - retention) * 30
}

function computeQuizPriority(progress: WordMastery | null, now: Date): number {
  if (!progress) return UNTESTED_PRIORITY
  if (!progress.tested_at) {
    return 30 - progress.level * 2
  }
  if (!progress.due_at) return 35
  const dueDate = dayjs(progress.due_at)
  const overdueDays = dayjs(now).diff(dueDate, 'day')
  if (!dueDate.isAfter(now)) {
    return 70 + Math.min(30, overdueDays * 4) - progress.level * 3
  }
  if (isMastered(progress.level)) return -1
  const msSinceTest = dayjs(now).diff(dayjs(progress.tested_at), 'millisecond')
  if (msSinceTest < RECENT_TEST_COOLDOWN_MS) {
    return msSinceTest / RECENT_TEST_COOLDOWN_MS
  }
  const retention = progressRetention(progress, now)
  return 40 - progress.level * 4 + (1 - retention) * 30
}

function isDueForDashboard(progress: WordMastery, now: Date): boolean {
  if (progress.due_at) {
    return !dayjs(progress.due_at).isAfter(now)
  }
  return !progress.tested_at
}

function localDayKey(d: Date): string {
  return dayjs(d).tz(APP_TIMEZONE).format('YYYY-MM-DD')
}

function dayOffsetFromKeys(fromKey: string, toKey: string): number {
  return dayjs.utc(toKey).diff(dayjs.utc(fromKey), 'day')
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return localDayKey(a) === localDayKey(b)
}

function wasWrongToday(progress: WordMastery, now: Date): boolean {
  if (progress.last_grade !== GRADE_AGAIN) return false
  if (!progress.tested_at) return false
  return isSameLocalDay(new Date(progress.tested_at), now)
}

class WordMasteryService {
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
      .from('word_mastery')
      .select('*')
      .eq('user_id', userId)
      .in('word_id', wordIds)

    if (progressError) throw progressError

    const progressMap = new Map<string, WordMastery>(
      (progressRows ?? []).map((p: WordMastery) => [p.word_id, p]),
    )

    const scored: ReviewWord[] = vocabs.map((vocab) => {
      const progress = progressMap.get(vocab.id) ?? null
      return { ...vocab, progress, score: computePracticeScore(progress) }
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
        unlearnedWords: [],
        practicingCount: 0,
        practicingWords: [],
        masteredCount: 0,
        masteredWords: [],
        needsTestingCount: 0,
        needsTestingWords: [],
        fadingCount: 0,
        fadingWords: [],
        wrongTodayCount: 0,
        wrongTodayWords: [],
        averageRetention: 1,
      }
    }

    const wordIds = vocabs.map((v) => v.id)

    const { data: progressRows, error: progressError } = await supabase
      .from('word_mastery')
      .select('*')
      .eq('user_id', userId)
      .in('word_id', wordIds)

    if (progressError) throw progressError

    const progressMap = new Map<string, WordMastery>(
      (progressRows ?? []).map((p: WordMastery) => [p.word_id, p]),
    )

    const now = dayjs().toDate()
    const learnedCount = progressRows?.length ?? 0

    const unlearnedWords: ReviewWord[] = vocabs
      .filter((v) => !progressMap.has(v.id))
      .map((v) => ({ ...v, progress: null, score: computePracticeScore(null) }))

    let masteredCount = 0
    let practicingCount = 0
    let needsTestingCount = 0
    let fadingCount = 0
    let retentionSum = 0
    let retentionN = 0
    const needsTestingPriorityList: { word: ReviewWord; priority: number }[] =
      []
    const practicingList: ReviewWord[] = []
    const masteredList: ReviewWord[] = []
    const fadingPriorityList: { word: ReviewWord; retention: number }[] = []
    let wrongTodayCount = 0
    const wrongTodayList: ReviewWord[] = []

    for (const vocab of vocabs) {
      const progress = progressMap.get(vocab.id)
      if (!progress) continue

      const reviewWord: ReviewWord = {
        ...vocab,
        progress,
        score: computePracticeScore(progress),
      }

      if (isMastered(progress.level)) {
        masteredCount += 1
        masteredList.push(reviewWord)
      } else {
        practicingCount += 1
        practicingList.push(reviewWord)
      }

      const retention = progressRetention(progress, now)
      if (progress.tested_at && progress.stability > 0) {
        retentionSum += retention
        retentionN += 1
      }
      if (
        retention < FADING_RETENTION_THRESHOLD &&
        isMastered(progress.level)
      ) {
        fadingCount += 1
        fadingPriorityList.push({ word: reviewWord, retention })
      }

      if (wasWrongToday(progress, now)) {
        wrongTodayCount += 1
        wrongTodayList.push(reviewWord)
      }

      if (!isDueForDashboard(progress, now)) continue
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
      unlearnedWords,
      practicingCount,
      practicingWords: practicingList,
      masteredCount,
      masteredWords: masteredList,
      needsTestingCount,
      needsTestingWords: needsTestingPriorityList
        .slice(0, NEEDS_TESTING_PREVIEW_LIMIT)
        .map((c) => c.word),
      fadingCount,
      fadingWords: fadingPriorityList
        .slice(0, FADING_PREVIEW_LIMIT)
        .map((c) => c.word),
      wrongTodayCount,
      wrongTodayWords: wrongTodayList.slice(0, WRONG_TODAY_PREVIEW_LIMIT),
      averageRetention: retentionN > 0 ? retentionSum / retentionN : 1,
    }
  }

  async getReviewForecast(
    userId: string,
    days: number = FORECAST_DAYS,
  ): Promise<ReviewForecast> {
    const { data: vocabs, error: vocabError } = await supabase
      .from('vocabularies')
      .select('id')

    if (vocabError) throw vocabError
    if (!vocabs || vocabs.length === 0) {
      return {
        todayCount: 0,
        nextFutureDate: null,
        nextFutureCount: 0,
        daysUntilNextFuture: null,
        overdueCount: 0,
        totalUpcoming: 0,
        forecast: [],
      }
    }

    const wordIds = vocabs.map((v) => v.id)
    const { data: progressRows, error: progressError } = await supabase
      .from('word_mastery')
      .select('*')
      .eq('user_id', userId)
      .in('word_id', wordIds)

    if (progressError) throw progressError

    const now = dayjs().toDate()
    const todayKey = localDayKey(now)

    const buckets = new Map<string, ForecastDayBreakdown>()
    for (let i = 0; i < days; i += 1) {
      buckets.set(dayjs.utc(todayKey).add(i, 'day').format('YYYY-MM-DD'), {
        practicing: 0,
      })
    }

    let overdueCount = 0
    for (const progress of (progressRows ?? []) as WordMastery[]) {
      if (isMastered(progress.level)) continue
      if (!progress.due_at) {
        if (!progress.tested_at) overdueCount += 1
        continue
      }

      const dueDateKey = localDayKey(dayjs(progress.due_at).toDate())
      const offset = dayOffsetFromKeys(todayKey, dueDateKey)

      if (offset < 0) {
        overdueCount += 1
        continue
      }
      if (offset >= days) continue

      const breakdown = buckets.get(dueDateKey)
      if (!breakdown) continue
      breakdown.practicing += 1
    }

    const forecast: ForecastDay[] = Array.from(
      buckets,
      ([date, breakdown]) => ({
        date,
        count: breakdown.practicing,
        breakdown,
      }),
    ).sort((a, b) => a.date.localeCompare(b.date))

    const totalUpcoming = forecast.reduce((sum, d) => sum + d.count, 0)
    const todayCount = forecast[0]?.count ?? 0
    const nextFuture = forecast.slice(1).find((d) => d.count > 0) ?? null
    const nextFutureDate = nextFuture?.date ?? null
    const nextFutureCount = nextFuture?.count ?? 0
    const daysUntilNextFuture = nextFutureDate
      ? dayOffsetFromKeys(todayKey, nextFutureDate)
      : null

    return {
      todayCount,
      nextFutureDate,
      nextFutureCount,
      daysUntilNextFuture,
      overdueCount,
      totalUpcoming,
      forecast,
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
      .from('word_mastery')
      .select('*')
      .eq('user_id', userId)
      .in('word_id', wordIds)
    if (progressError) throw progressError

    const progressMap = new Map<string, WordMastery>(
      (progressRows ?? []).map((p: WordMastery) => [p.word_id, p]),
    )
    const now = dayjs().toDate()

    const candidates: { word: ReviewWord; priority: number }[] = []
    for (const vocab of vocabs) {
      const progress = progressMap.get(vocab.id) ?? null
      if (progress && !isDueForDashboard(progress, now)) continue
      const priority = computeQuizPriority(progress, now)
      if (priority < 0) continue
      candidates.push({
        word: { ...vocab, progress, score: computePracticeScore(progress) },
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
    const now = dayjs().toDate()
    const wordIds = results.map((r) => r.wordId)

    const { data: existing, error: fetchError } = await supabase
      .from('word_mastery')
      .select('*')
      .eq('user_id', userId)
      .in('word_id', wordIds)

    if (fetchError) throw fetchError

    const existingMap = new Map<string, WordMastery>(
      (existing ?? []).map((p: WordMastery) => [p.word_id, p]),
    )

    const payload = results.map((r) => {
      const prev = existingMap.get(r.wordId)
      const grade: Grade = deriveGrade({
        isCorrect: r.isCorrect,
        responseMs: r.responseMs,
        usedHint: r.usedHint,
        word: r.word,
      })

      const schedule = nextSchedule({
        prevMastery: prev?.level ?? 0,
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
        level: schedule.mastery,
        correct_count: (prev?.correct_count ?? 0) + (r.isCorrect ? 1 : 0),
        wrong_count: (prev?.wrong_count ?? 0) + (r.isCorrect ? 0 : 1),
        tested_at: now.toISOString(),
        due_at: schedule.dueAt.toISOString(),
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
      .from('word_mastery')
      .upsert(payload, { onConflict: 'user_id,word_id' })

    if (upsertError) throw upsertError
  }

  async softDemoteMastery(userId: string, wordId: string): Promise<void> {
    const now = dayjs().toDate()
    const { data: existing, error: fetchError } = await supabase
      .from('word_mastery')
      .select('*')
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .maybeSingle()

    if (fetchError) throw fetchError
    if (!existing) return

    const demotedLevel = Math.min(existing.level, MASTERED_THRESHOLD - 1)
    const demotedStability = Math.max(0.5, (existing.stability ?? 0) * 0.2)

    const { error: updateError } = await supabase
      .from('word_mastery')
      .update({
        level: demotedLevel,
        is_relearning: false,
        relearning_step: 0,
        stability: demotedStability,
        due_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('user_id', userId)
      .eq('word_id', wordId)

    if (updateError) throw updateError
  }
}

export const wordMasteryService = new WordMasteryService()
