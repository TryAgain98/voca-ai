import { dictionary } from 'cmu-pronouncing-dictionary'
import { doubleMetaphone } from 'double-metaphone'

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

function normalizeDictionaryPronunciation(value: string): string {
  return value.replace(/\d/g, '')
}

function getDictionaryPronunciations(word: string): string[] {
  const pronunciations = new Set<string>()
  const keys = [
    word,
    ...Array.from({ length: 10 }, (_, i) => `${word}(${i + 1})`),
  ]

  for (const key of keys) {
    const pronunciation = dictionary[key as keyof typeof dictionary]
    if (pronunciation) {
      pronunciations.add(normalizeDictionaryPronunciation(pronunciation))
    }
  }

  return [...pronunciations]
}

function haveSharedDictionaryPronunciation(a: string, b: string): boolean {
  const aPronunciations = new Set(getDictionaryPronunciations(a))
  if (aPronunciations.size === 0) return false

  return getDictionaryPronunciations(b).some((pronunciation) =>
    aPronunciations.has(pronunciation),
  )
}

const VOWEL_PHONES = new Set([
  'AA',
  'AE',
  'AH',
  'AO',
  'AW',
  'AY',
  'EH',
  'ER',
  'EY',
  'IH',
  'IY',
  'OW',
  'OY',
  'UH',
  'UW',
])

function getDictionaryVowelPatterns(word: string): string[] {
  return getDictionaryPronunciations(word).map((pronunciation) =>
    pronunciation
      .split(' ')
      .filter((phone) => VOWEL_PHONES.has(phone))
      .join(' '),
  )
}

function haveSharedDictionaryVowelPattern(a: string, b: string): boolean {
  const aPatterns = new Set(getDictionaryVowelPatterns(a))
  if (aPatterns.size === 0) return false

  return getDictionaryVowelPatterns(b).some((pattern) => aPatterns.has(pattern))
}

function getPhoneticCodes(word: string): string[] {
  return doubleMetaphone(word).filter(Boolean)
}

function haveSharedPhoneticCode(a: string, b: string): boolean {
  const aCodes = new Set(getPhoneticCodes(a))
  return getPhoneticCodes(b).some((code) => aCodes.has(code))
}

function normalizedLevenshteinScore(a: string, b: string): number {
  const dist = levenshtein(a, b)
  return Math.max(
    0,
    Math.round((1 - dist / Math.max(a.length, b.length)) * 100),
  )
}

function scoreWord(expected: string, got: string): number {
  const a = normalizeWord(expected)
  const b = normalizeWord(got)
  if (!a) return 100
  if (!b) return 0
  if (a === b) return 100

  const textScore = normalizedLevenshteinScore(a, b)

  if (haveSharedDictionaryPronunciation(a, b)) return 100

  // ASR often writes a correctly pronounced word as a nearby real word
  // (for example "spacious" -> "spaces"). Keep these as passable matches
  // only when the spelling is still close enough to avoid broad false passes.
  const hasFullDictionaryCoverage =
    getDictionaryPronunciations(a).length > 0 &&
    getDictionaryPronunciations(b).length > 0
  const hasCompatibleVowels =
    !hasFullDictionaryCoverage || haveSharedDictionaryVowelPattern(a, b)

  if (textScore >= 60 && hasCompatibleVowels && haveSharedPhoneticCode(a, b)) {
    return Math.max(textScore, 88)
  }

  return textScore
}

function tokenizeWords(text: string): string[] {
  return text.match(/\b[\w']+\b/g) ?? []
}

const MIN_MATCH_SCORE = 45

function alignWords(expected: string[], transcript: string[]): WordResult[] {
  const m = expected.length
  const n = transcript.length

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  const choice = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(''))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const wordScore = scoreWord(expected[i - 1], transcript[j - 1])
      // Reject near-zero matches to avoid cascade alignment errors when ASR
      // drops or mishears a word — prefer marking it missed over a bad match.
      const matchScore =
        wordScore >= MIN_MATCH_SCORE ? dp[i - 1][j - 1] + wordScore : -1
      const missScore = dp[i - 1][j]
      const skipScore = dp[i][j - 1]

      if (matchScore >= missScore && matchScore >= skipScore) {
        dp[i][j] = matchScore
        choice[i][j] = 'match'
      } else if (missScore >= skipScore) {
        dp[i][j] = missScore
        choice[i][j] = 'miss'
      } else {
        dp[i][j] = skipScore
        choice[i][j] = 'skip'
      }
    }
  }

  const results: WordResult[] = new Array(m)
  let i = m
  let j = n

  while (i > 0 || j > 0) {
    if (i === 0) {
      j--
      continue
    }
    if (j === 0) {
      results[i - 1] = {
        word: expected[i - 1],
        expected: expected[i - 1],
        got: '',
        score: 0,
      }
      i--
      continue
    }
    const op = choice[i][j]
    if (op === 'match') {
      const w = expected[i - 1]
      const g = transcript[j - 1]
      results[i - 1] = { word: w, expected: w, got: g, score: scoreWord(w, g) }
      i--
      j--
    } else if (op === 'miss') {
      results[i - 1] = {
        word: expected[i - 1],
        expected: expected[i - 1],
        got: '',
        score: 0,
      }
      i--
    } else {
      j--
    }
  }

  return results
}

export function scorePassage(
  transcript: string,
  expected: string,
): WordResult[] {
  const expectedWords = tokenizeWords(expected)
  const transcriptWords = tokenizeWords(transcript)
  return alignWords(expectedWords, transcriptWords)
}

export function overallScore(results: WordResult[]): number {
  if (results.length === 0) return 0
  const sum = results.reduce((acc, r) => acc + r.score, 0)
  return Math.round(sum / results.length)
}

export const PASSING_WORD_SCORE = 85

export interface PassageExamScore {
  overallScore: number
  pronunciationScore: number
  fluencyScore: number | null
  timePenalty: number
}

export function calculatePassageExamScore(
  pronunciationScore: number,
  elapsedSeconds: number,
  benchmarkSeconds: number | null,
): PassageExamScore {
  if (!benchmarkSeconds || elapsedSeconds <= 0) {
    return {
      overallScore: pronunciationScore,
      pronunciationScore,
      fluencyScore: null,
      timePenalty: 0,
    }
  }

  if (elapsedSeconds <= benchmarkSeconds) {
    return {
      overallScore: pronunciationScore,
      pronunciationScore,
      fluencyScore: 100,
      timePenalty: 0,
    }
  }

  const overRatio = (elapsedSeconds - benchmarkSeconds) / benchmarkSeconds
  const timePenalty = Math.min(40, Math.ceil(overRatio * 100))

  return {
    overallScore: Math.max(0, pronunciationScore - timePenalty),
    pronunciationScore,
    fluencyScore: Math.max(0, 100 - timePenalty),
    timePenalty,
  }
}

export interface PassageExamOutcome {
  passed: boolean
  missingCount: number
  incorrectCount: number
  overTime: boolean
}

export function evaluatePassageExamOutcome(
  wordResults: WordResult[],
  elapsedSeconds: number | null,
  benchmarkSeconds: number | null,
): PassageExamOutcome {
  const missingCount = wordResults.filter((r) => !r.got).length
  const incorrectCount = wordResults.filter(
    (r) => r.got && r.score < PASSING_WORD_SCORE,
  ).length
  const overTime =
    benchmarkSeconds !== null &&
    elapsedSeconds !== null &&
    elapsedSeconds > benchmarkSeconds

  return {
    passed:
      wordResults.length > 0 &&
      missingCount === 0 &&
      incorrectCount === 0 &&
      !overTime,
    missingCount,
    incorrectCount,
    overTime,
  }
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
