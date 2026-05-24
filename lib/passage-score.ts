import type { WordResult } from '~/types'

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function normalizeWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z0-9']/g, '')
}

function scoreWord(expected: string, got: string): number {
  const a = normalizeWord(expected)
  const b = normalizeWord(got)
  if (!a) return 100
  if (!b) return 0
  if (a === b) return 100
  const dist = levenshtein(a, b)
  return Math.max(
    0,
    Math.round((1 - dist / Math.max(a.length, b.length)) * 100),
  )
}

function tokenizeWords(text: string): string[] {
  return text.match(/\b[\w']+\b/g) ?? []
}

export function scorePassage(
  transcript: string,
  expected: string,
): WordResult[] {
  const expectedWords = tokenizeWords(expected)
  const transcriptWords = tokenizeWords(transcript)

  return expectedWords.map((word, i) => {
    const got = transcriptWords[i] ?? ''
    return { word, expected: word, got, score: scoreWord(word, got) }
  })
}

export function overallScore(results: WordResult[]): number {
  if (results.length === 0) return 0
  const sum = results.reduce((acc, r) => acc + r.score, 0)
  return Math.round(sum / results.length)
}

export type ScoreLevel = 'good' | 'ok' | 'poor'

export function scoreLevel(score: number): ScoreLevel {
  if (score >= 85) return 'good'
  if (score >= 65) return 'ok'
  return 'poor'
}

export function scoreColor(score: number): string {
  const level = scoreLevel(score)
  if (level === 'good') return 'text-emerald-400'
  if (level === 'ok') return 'text-amber-400'
  return 'text-red-400'
}

export function scoreBg(score: number): string {
  const level = scoreLevel(score)
  if (level === 'good') return 'bg-emerald-400/20'
  if (level === 'ok') return 'bg-amber-400/20'
  return 'bg-red-400/20'
}
