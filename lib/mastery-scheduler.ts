/**
 * Forgetting-curve scheduler for test-validated mastery.
 *
 * mastery_level rises 0→5 with consecutive correct answers in tests.
 * Each level extends the "safe-to-forget" window (next_test_due_at).
 * A wrong answer drops the level by 1 and resets the window to 1 day.
 */

const MASTERY_INTERVAL_DAYS = [1, 1, 3, 7, 16, 35] as const

export const MAX_MASTERY_LEVEL = 5
export const MASTERED_THRESHOLD = 3

export function nextMasteryLevel(
  currentLevel: number,
  isCorrect: boolean,
): number {
  if (isCorrect) return Math.min(currentLevel + 1, MAX_MASTERY_LEVEL)
  return Math.max(currentLevel - 1, 0)
}

export function nextTestDueAt(level: number, from: Date = new Date()): Date {
  const days = MASTERY_INTERVAL_DAYS[Math.min(level, MAX_MASTERY_LEVEL)] ?? 1
  const next = new Date(from)
  next.setDate(next.getDate() + days)
  return next
}

export function isMastered(level: number): boolean {
  return level >= MASTERED_THRESHOLD
}
