import { APP_TIMEZONE, dayjs } from '~/lib/dayjs'

export const MAX_MASTERY_LEVEL = 5
export const MASTERED_THRESHOLD = 3

export const GRADE_AGAIN = 1
export const GRADE_HARD = 2
export const GRADE_GOOD = 3
export const GRADE_EASY = 4

export type Grade =
  | typeof GRADE_AGAIN
  | typeof GRADE_HARD
  | typeof GRADE_GOOD
  | typeof GRADE_EASY

const MIN_EASE = 1.3
const MAX_EASE = 3.0
const DEFAULT_EASE = 2.5

const MIN_DIFFICULTY = 1
const MAX_DIFFICULTY = 10
const DEFAULT_DIFFICULTY = 5

const TARGET_RETENTION = 0.9
const RETRIEVABILITY_DECAY = -Math.log(TARGET_RETENTION)

const MS_PER_DAY = 1000 * 60 * 60 * 24
const MS_PER_MIN = 1000 * 60
const LAPSE_GRACE_MS = 5 * 60 * 60 * 1000

const RELEARNING_STEPS_MIN = [10, 1440] as const
const FAST_GOOD_THRESHOLD_MS = 5000
const SLOW_GOOD_THRESHOLD_MS = 10000
const NO_PROGRESS_TIMEOUT_MS = 20000
const LONG_WORD_LETTER_THRESHOLD = 8

const EASE_DELTA: Record<Grade, number> = {
  [GRADE_AGAIN]: -0.2,
  [GRADE_HARD]: -0.05,
  [GRADE_GOOD]: 0.05,
  [GRADE_EASY]: 0.15,
}

const DIFFICULTY_DELTA: Record<Grade, number> = {
  [GRADE_AGAIN]: 1.0,
  [GRADE_HARD]: 0.4,
  [GRADE_GOOD]: -0.1,
  [GRADE_EASY]: -0.4,
}

const INTERVAL_MULTIPLIER: Record<Grade, number> = {
  [GRADE_AGAIN]: 0,
  [GRADE_HARD]: 1.2,
  [GRADE_GOOD]: 2.5,
  [GRADE_EASY]: 4.0,
}

export interface SchedulerInput {
  prevMastery: number
  prevEase: number
  prevStability: number
  prevDifficulty: number
  prevIsRelearning: boolean
  prevRelearningStep: number
  grade: Grade
  now?: Date
}

export interface SchedulerOutput {
  mastery: number
  ease: number
  stability: number
  difficulty: number
  isRelearning: boolean
  relearningStep: number
  dueAt: Date
  isLapse: boolean
}

interface DeriveGradeInput {
  isCorrect: boolean
  responseMs?: number | null
  usedHint?: boolean | null
  word?: string | null
}

export function deriveGrade({
  isCorrect,
  responseMs,
  usedHint,
  word,
}: DeriveGradeInput): Grade {
  if (!isCorrect) return GRADE_AGAIN
  if (usedHint) return GRADE_HARD
  if (responseMs == null) return GRADE_GOOD
  if (responseMs >= NO_PROGRESS_TIMEOUT_MS) return GRADE_HARD
  if (responseMs <= FAST_GOOD_THRESHOLD_MS) return GRADE_EASY
  const letterCount = word ? word.replace(/\s/g, '').length : 0
  if (
    letterCount <= LONG_WORD_LETTER_THRESHOLD &&
    responseMs >= SLOW_GOOD_THRESHOLD_MS
  )
    return GRADE_HARD
  return GRADE_GOOD
}

export function isMastered(level: number): boolean {
  return level >= MASTERED_THRESHOLD
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function addMs(date: Date, ms: number): Date {
  return dayjs(date).add(ms, 'millisecond').toDate()
}

function nextStability(
  prevStability: number,
  difficulty: number,
  ease: number,
  grade: Grade,
): number {
  if (grade === GRADE_AGAIN) {
    return Math.max(0.5, prevStability * 0.2)
  }
  const base = Math.max(prevStability, 1)
  const easeBoost = ease / DEFAULT_EASE
  const difficultyPenalty = 1 - (difficulty - DEFAULT_DIFFICULTY) * 0.05
  return base * INTERVAL_MULTIPLIER[grade] * easeBoost * difficultyPenalty
}

function intervalDaysFromStability(stability: number): number {
  if (stability <= 0) return 1
  return Math.max(1, Math.round(stability))
}

function nextMasteryLevel(prevMastery: number, grade: Grade): number {
  if (grade === GRADE_AGAIN) {
    if (prevMastery >= MASTERED_THRESHOLD) {
      return Math.max(prevMastery - 2, 0)
    }
    return Math.max(prevMastery - 1, 0)
  }
  if (grade === GRADE_HARD) return prevMastery
  const inc = grade === GRADE_EASY ? 2 : 1
  return Math.min(prevMastery + inc, MAX_MASTERY_LEVEL)
}

function relearningDueAt(step: number, now: Date): Date {
  const minutes = RELEARNING_STEPS_MIN[step] ?? 1440
  return addMs(now, minutes * MS_PER_MIN)
}

function startOfNextDay(now: Date): Date {
  return dayjs(now).tz(APP_TIMEZONE).add(1, 'day').startOf('day').toDate()
}

function lapseDueAt(now: Date): Date {
  const graceEnd = addMs(now, LAPSE_GRACE_MS)
  const tomorrow = startOfNextDay(now)
  return graceEnd < tomorrow ? tomorrow : graceEnd
}

export function nextSchedule(input: SchedulerInput): SchedulerOutput {
  const now = input.now ?? dayjs().toDate()
  const grade = input.grade
  const wasMastered = input.prevMastery >= MASTERED_THRESHOLD

  const nextEase = clamp(input.prevEase + EASE_DELTA[grade], MIN_EASE, MAX_EASE)
  const nextDifficulty = clamp(
    input.prevDifficulty + DIFFICULTY_DELTA[grade],
    MIN_DIFFICULTY,
    MAX_DIFFICULTY,
  )
  const newMastery = nextMasteryLevel(input.prevMastery, grade)
  const isLapse = grade === GRADE_AGAIN && wasMastered

  if (isLapse) {
    const stepDue = relearningDueAt(0, now)
    return {
      mastery: newMastery,
      ease: nextEase,
      stability: Math.max(0.5, input.prevStability * 0.2),
      difficulty: nextDifficulty,
      isRelearning: true,
      relearningStep: 0,
      dueAt: stepDue,
      isLapse: true,
    }
  }

  if (input.prevIsRelearning) {
    if (grade === GRADE_AGAIN) {
      return {
        mastery: newMastery,
        ease: nextEase,
        stability: Math.max(0.5, input.prevStability * 0.5),
        difficulty: nextDifficulty,
        isRelearning: true,
        relearningStep: 0,
        dueAt: relearningDueAt(0, now),
        isLapse: false,
      }
    }
    const nextStep = input.prevRelearningStep + 1
    if (nextStep < RELEARNING_STEPS_MIN.length) {
      return {
        mastery: newMastery,
        ease: nextEase,
        stability: input.prevStability,
        difficulty: nextDifficulty,
        isRelearning: true,
        relearningStep: nextStep,
        dueAt: relearningDueAt(nextStep, now),
        isLapse: false,
      }
    }
    const stability = nextStability(
      Math.max(input.prevStability, 1),
      nextDifficulty,
      nextEase,
      grade,
    )
    return {
      mastery: newMastery,
      ease: nextEase,
      stability,
      difficulty: nextDifficulty,
      isRelearning: false,
      relearningStep: 0,
      dueAt: addMs(now, intervalDaysFromStability(stability) * MS_PER_DAY),
      isLapse: false,
    }
  }

  if (grade === GRADE_AGAIN) {
    return {
      mastery: newMastery,
      ease: nextEase,
      stability: Math.max(0.5, input.prevStability * 0.2),
      difficulty: nextDifficulty,
      isRelearning: false,
      relearningStep: 0,
      dueAt: lapseDueAt(now),
      isLapse: false,
    }
  }

  const stability = nextStability(
    input.prevStability,
    nextDifficulty,
    nextEase,
    grade,
  )
  return {
    mastery: newMastery,
    ease: nextEase,
    stability,
    difficulty: nextDifficulty,
    isRelearning: false,
    relearningStep: 0,
    dueAt: addMs(now, intervalDaysFromStability(stability) * MS_PER_DAY),
    isLapse: false,
  }
}

export function retrievability(
  stability: number,
  daysSinceReview: number,
): number {
  if (stability <= 0) return 0
  return Math.exp(-RETRIEVABILITY_DECAY * (daysSinceReview / stability))
}

export const DEFAULTS = {
  ease: DEFAULT_EASE,
  difficulty: DEFAULT_DIFFICULTY,
  stability: 0,
}
