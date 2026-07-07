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

export function normalizePunctuation(text: string): string {
  return text.replace(/[‘’ʼʻ]/g, "'")
}

function normalizeWord(w: string): string {
  return normalizePunctuation(w)
    .toLowerCase()
    .replace(/[^a-z0-9']/g, '')
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
  return normalizePunctuation(text).match(/\b[\w']+\b/g) ?? []
}

const CONTRACTION_EXPANSIONS: Record<string, string> = {
  "it's": 'it is',
  "that's": 'that is',
  "there's": 'there is',
  "here's": 'here is',
  "what's": 'what is',
  "who's": 'who is',
  "where's": 'where is',
  "how's": 'how is',
  "when's": 'when is',
  "he's": 'he is',
  "she's": 'she is',
  "let's": 'let us',
  "we're": 'we are',
  "they're": 'they are',
  "you're": 'you are',
  "i'm": 'i am',
  "i've": 'i have',
  "we've": 'we have',
  "they've": 'they have',
  "you've": 'you have',
  "i'll": 'i will',
  "we'll": 'we will',
  "they'll": 'they will',
  "you'll": 'you will',
  "he'll": 'he will',
  "she'll": 'she will',
  "i'd": 'i would',
  "we'd": 'we would',
  "they'd": 'they would',
  "you'd": 'you would',
  "he'd": 'he would',
  "she'd": 'she would',
  "don't": 'do not',
  "doesn't": 'does not',
  "didn't": 'did not',
  "won't": 'will not',
  "wouldn't": 'would not',
  "shouldn't": 'should not',
  "couldn't": 'could not',
  "can't": 'can not',
  "isn't": 'is not',
  "aren't": 'are not',
  "wasn't": 'was not',
  "weren't": 'were not',
  "hasn't": 'has not',
  "haven't": 'have not',
  "hadn't": 'had not',
}

function getContractionExpansion(word: string): [string, string] | null {
  const expansion = CONTRACTION_EXPANSIONS[word.toLowerCase()]
  if (!expansion) return null
  const parts = expansion.split(' ')
  if (parts.length !== 2) return null
  return [parts[0], parts[1]]
}

function scoreContractionPair(
  expected: string,
  gotFirst: string,
  gotSecond: string,
): number {
  const expansion = getContractionExpansion(expected)
  if (!expansion) return 0
  const s1 = scoreWord(expansion[0], gotFirst)
  const s2 = scoreWord(expansion[1], gotSecond)
  return Math.round((s1 + s2) / 2)
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

      // ASR often expands contractions ("it's" → "it is"). Allow an expected
      // contraction to consume two adjacent transcript tokens.
      let pairScore = -1
      if (j >= 2 && getContractionExpansion(expected[i - 1])) {
        const pairWordScore = scoreContractionPair(
          expected[i - 1],
          transcript[j - 2],
          transcript[j - 1],
        )
        if (pairWordScore >= MIN_MATCH_SCORE) {
          pairScore = dp[i - 1][j - 2] + pairWordScore
        }
      }

      const best = Math.max(matchScore, missScore, skipScore, pairScore)
      if (best === pairScore && pairScore >= 0) {
        dp[i][j] = pairScore
        choice[i][j] = 'matchPair'
      } else if (best === matchScore && matchScore >= 0) {
        dp[i][j] = matchScore
        choice[i][j] = 'match'
      } else if (best === missScore) {
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
    } else if (op === 'matchPair') {
      const w = expected[i - 1]
      const g1 = transcript[j - 2]
      const g2 = transcript[j - 1]
      results[i - 1] = {
        word: w,
        expected: w,
        got: `${g1} ${g2}`,
        score: scoreContractionPair(w, g1, g2),
      }
      i--
      j -= 2
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

// ASR fuses clock times and meridiems ("4.30pm", "4:30 pm") while passages are
// written "4:30 p.m." The word tokenizer splits "p.m." into ["p","m"], so
// expand any digit-anchored am/pm in the transcript into the same two-letter
// form to keep alignment exact. The leading-digit requirement avoids touching
// the verb "am" ("I am ...").
function normalizeTranscriptText(transcript: string): string {
  return transcript.replace(/(\d)\s*([ap])\.?\s*m\b\.?/gi, '$1 $2 m')
}

export function scorePassage(
  transcript: string,
  expected: string,
): WordResult[] {
  const expectedWords = tokenizeWords(normalizeTranscriptText(expected))
  const transcriptWords = tokenizeWords(normalizeTranscriptText(transcript))
  return alignWords(expectedWords, transcriptWords)
}

export function overallScore(results: WordResult[]): number {
  if (results.length === 0) return 0
  const sum = results.reduce((acc, r) => acc + r.score, 0)
  return Math.round(sum / results.length)
}

export const PASSING_WORD_SCORE = 85
export const PASSING_OVERALL_SCORE = 90

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
      overallScore(wordResults) >= PASSING_OVERALL_SCORE &&
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
