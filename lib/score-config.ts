export const SCORE_MAX = { completion: 35, discipline: 25, streak: 40 } as const
export const STREAK_CAP = 30

export type ScoreBreakdown = {
  completion: number
  discipline: number
  streak: number
}
