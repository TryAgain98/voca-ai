export type ScoreTierKey =
  | 'perfect'
  | 'excellent'
  | 'great'
  | 'good'
  | 'keep'
  | 'practice'

export interface ScoreTier {
  key: ScoreTierKey
  emoji: string
  accent: string
  glow: string
  ring: string
  confetti: boolean
}

export function getScoreTier(score: number): ScoreTier {
  if (score >= 1) {
    return {
      key: 'perfect',
      emoji: '🏆',
      accent: 'text-amber-400',
      glow: 'bg-amber-400/15',
      ring: 'stroke-amber-400',
      confetti: true,
    }
  }
  if (score >= 0.9) {
    return {
      key: 'excellent',
      emoji: '🎉',
      accent: 'text-emerald-500',
      glow: 'bg-emerald-500/15',
      ring: 'stroke-emerald-500',
      confetti: true,
    }
  }
  if (score >= 0.8) {
    return {
      key: 'great',
      emoji: '✨',
      accent: 'text-emerald-400',
      glow: 'bg-emerald-400/15',
      ring: 'stroke-emerald-400',
      confetti: true,
    }
  }
  if (score >= 0.7) {
    return {
      key: 'good',
      emoji: '👍',
      accent: 'text-sky-500',
      glow: 'bg-sky-500/15',
      ring: 'stroke-sky-500',
      confetti: false,
    }
  }
  if (score >= 0.5) {
    return {
      key: 'keep',
      emoji: '💪',
      accent: 'text-orange-500',
      glow: 'bg-orange-500/15',
      ring: 'stroke-orange-500',
      confetti: false,
    }
  }
  return {
    key: 'practice',
    emoji: '🌱',
    accent: 'text-rose-400',
    glow: 'bg-rose-400/15',
    ring: 'stroke-rose-400',
    confetti: false,
  }
}
