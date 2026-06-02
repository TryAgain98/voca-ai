import { APP_TIMEZONE, dayjs } from '~/lib/dayjs'

export const LEVEL_INTERVAL_DAYS = [1, 3, 4, 7, 20, 30, 50, 100]
export const MAX_LEVEL = LEVEL_INTERVAL_DAYS.length - 1

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

const FAST_ANSWER_MS = 5000

const GRADE_STEP: Record<Grade, number> = {
  [GRADE_AGAIN]: 0,
  [GRADE_HARD]: 0,
  [GRADE_GOOD]: 1,
  [GRADE_EASY]: 2,
}

export interface SchedulerInput {
  prevLevel: number
  prevMaxLevel: number
  grade: Grade
  now?: Date
}

export interface SchedulerOutput {
  level: number
  maxLevel: number
  dueAt: Date
}

interface DeriveGradeInput {
  isCorrect: boolean
  responseMs?: number | null
  usedHint?: boolean | null
}

export function deriveGrade({
  isCorrect,
  responseMs,
  usedHint,
}: DeriveGradeInput): Grade {
  if (!isCorrect) return GRADE_AGAIN
  if (usedHint) return GRADE_HARD
  if (responseMs != null && responseMs <= FAST_ANSWER_MS) return GRADE_EASY
  return GRADE_GOOD
}

export function isMastered(level: number): boolean {
  return level >= MASTERED_THRESHOLD
}

export function intervalDays(level: number): number {
  const clamped = Math.max(0, Math.min(MAX_LEVEL, level))
  return LEVEL_INTERVAL_DAYS[clamped]
}

function dueFromLevel(now: Date, level: number): Date {
  // Add the interval in whole days, then snap to the start of that day (VN
  // time) so the word is reviewable any time during its due day.
  return dayjs(now)
    .tz(APP_TIMEZONE)
    .add(intervalDays(level), 'day')
    .startOf('day')
    .toDate()
}

function nextLevelOnPass(
  prevLevel: number,
  prevMaxLevel: number,
  step: number,
): number {
  if (prevLevel >= prevMaxLevel) {
    return Math.min(MAX_LEVEL, prevLevel + step)
  }
  const recovery = Math.max(step, Math.ceil((prevMaxLevel - prevLevel) / 2))
  return Math.min(prevMaxLevel, prevLevel + recovery)
}

export function nextSchedule(input: SchedulerInput): SchedulerOutput {
  const now = input.now ?? dayjs().toDate()

  // Wrong: drop to the bottom, review tomorrow.
  if (input.grade === GRADE_AGAIN) {
    return {
      level: 0,
      maxLevel: input.prevMaxLevel,
      dueAt: dueFromLevel(now, 0),
    }
  }

  // Needed a hint: no progress, review again tomorrow.
  if (input.grade === GRADE_HARD) {
    return {
      level: input.prevLevel,
      maxLevel: input.prevMaxLevel,
      dueAt: dueFromLevel(now, 0),
    }
  }

  const level = nextLevelOnPass(
    input.prevLevel,
    input.prevMaxLevel,
    GRADE_STEP[input.grade],
  )
  return {
    level,
    maxLevel: Math.max(input.prevMaxLevel, level),
    dueAt: dueFromLevel(now, level),
  }
}

export function pronunciationFailedSchedule(input: {
  prevLevel: number
  prevMaxLevel: number
  now?: Date
}): SchedulerOutput {
  const now = input.now ?? dayjs().toDate()
  return {
    level: input.prevLevel,
    maxLevel: input.prevMaxLevel,
    dueAt: dueFromLevel(now, 0),
  }
}
