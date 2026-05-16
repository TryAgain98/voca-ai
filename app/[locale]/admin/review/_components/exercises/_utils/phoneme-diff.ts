import { dictionary } from 'cmu-pronouncing-dictionary'
import { doubleMetaphone } from 'double-metaphone'

export type TokenStatus = 'match' | 'wrong' | 'missing' | 'extra'

export interface DiffToken {
  char: string
  status: TokenStatus
}

export type SpeechDecisionReason =
  | 'exact-text'
  | 'dictionary-homophone'
  | 'phonetic-code'
  | 'consonant-skeleton'
  | 'text-similarity'
  | 'phrase-main-part'
  | 'close'
  | 'retry'

export interface SpeechCandidateDebug {
  transcript: string
  score: number
  matchRatio: number
  reason: SpeechDecisionReason
  isPass: boolean
  isClose: boolean
  isExact: boolean
  isPhoneticMatch: boolean
  isTextPass: boolean
  isPhrasePass: boolean
  dictionaryPronunciations: string[]
  phoneticCodes: string[]
  consonantSkeleton: string
  vowelSkeleton: string
}

export interface SpeechDiffDebug {
  expected: string
  normalizedExpected: string
  rawTranscripts: string[]
  passThreshold: number
  closeThreshold: number
  expectedDictionaryPronunciations: string[]
  expectedPhoneticCodes: string[]
  expectedConsonantSkeleton: string
  expectedVowelSkeleton: string
  candidates: SpeechCandidateDebug[]
  decisionReason: SpeechDecisionReason
}

export interface SpeechDiff {
  tokens: DiffToken[]
  score: number
  displayScore: number
  matchRatio: number
  expectedSyllables: number
  recognizedSyllables: number
  isExact: boolean
  isPass: boolean
  isClose: boolean
  isPhoneticMatch: boolean
  bestTranscript: string
  decisionReason: SpeechDecisionReason
  debug: SpeechDiffDebug
}

function normalizeSpeechText(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’.-]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getPassThreshold(expected: string): number {
  const words = expected.split(' ').filter(Boolean)
  if (words.length > 1) return 0.65
  if (expected.length <= 3) return 0.9
  if (expected.length <= 6) return 0.75
  return 0.7
}

function buildEditTable(a: string, b: string): number[][] {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  )
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      )
    }
  }
  return dp
}

function traceback(dp: number[][], a: string, b: string): DiffToken[] {
  const tokens: DiffToken[] = []
  let i = a.length
  let j = b.length

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      tokens.unshift({ char: a[i - 1], status: 'match' })
      i--
      j--
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      tokens.unshift({ char: a[i - 1], status: 'wrong' })
      i--
      j--
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      tokens.unshift({ char: a[i - 1], status: 'missing' })
      i--
    } else {
      tokens.unshift({ char: b[j - 1], status: 'extra' })
      j--
    }
  }
  return tokens
}

function countSyllables(word: string): number {
  return (word.toLowerCase().match(/[aeiouy]+/g) ?? []).length || 1
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0
  if (a === b) return 1
  const dp = buildEditTable(a, b)
  const distance = dp[a.length][b.length]
  return Math.max(0, 1 - distance / Math.max(a.length, b.length))
}

function getWords(value: string): string[] {
  return value.split(' ').filter(Boolean)
}

function getVowelSkeleton(word: string): string {
  return word
    .replace(/igh/g, 'i')
    .replace(/e$/g, '')
    .replace(/[^aeiouy]/g, '')
    .replace(/(.)\1+/g, '$1')
}

function getConsonantSkeleton(word: string): string {
  return word
    .replace(/[^a-z]/g, '')
    .replace(/[aeiouy]/g, '')
    .replace(/(.)\1+/g, '$1')
}

function normalizeLiquidConsonants(value: string): string {
  return value.replace(/[rl]/g, 'L')
}

function getPhoneticCodes(value: string): string[] {
  return getWords(value).flatMap((word) =>
    doubleMetaphone(word).filter(Boolean),
  )
}

function haveSharedPhoneticCode(a: string, b: string): boolean {
  const aCodes = new Set(getPhoneticCodes(a))
  const bCodes = getPhoneticCodes(b)

  return bCodes.some((code) => aCodes.has(code))
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

function getPhoneticReason(
  expected: string,
  candidate: string,
  textScore: number,
): Extract<
  SpeechDecisionReason,
  'dictionary-homophone' | 'phonetic-code'
> | null {
  const expectedWords = getWords(expected)
  const candidateWords = getWords(candidate)
  if (expectedWords.length !== 1 || candidateWords.length !== 1) return null

  const expectedWord = expectedWords[0]
  const candidateWord = candidateWords[0]
  if (!expectedWord || !candidateWord || expectedWord === candidateWord) {
    return null
  }
  if (haveSharedDictionaryPronunciation(expectedWord, candidateWord)) {
    return 'dictionary-homophone'
  }
  if (textScore < 0.45) return null
  if (
    getConsonantSkeleton(expectedWord) !== getConsonantSkeleton(candidateWord)
  ) {
    return null
  }

  return haveSharedPhoneticCode(expectedWord, candidateWord)
    ? 'phonetic-code'
    : null
}

function canPassByTextSimilarity(
  expected: string,
  spoken: string,
  textScore: number,
  threshold: number,
): boolean {
  if (textScore < threshold) return false

  const expectedWords = getWords(expected)
  const spokenWords = getWords(spoken)
  if (expectedWords.length !== 1 || spokenWords.length !== 1) return true

  const expectedWord = expectedWords[0]
  const spokenWord = spokenWords[0]
  if (!expectedWord || !spokenWord || expectedWord.length > 6) return true

  return (
    getVowelSkeleton(expectedWord) === getVowelSkeleton(spokenWord) &&
    haveSharedPhoneticCode(expectedWord, spokenWord)
  )
}

function canPassByConsonantSkeleton(
  expected: string,
  spoken: string,
  textScore: number,
): boolean {
  const expectedWords = getWords(expected)
  const spokenWords = getWords(spoken)
  if (expectedWords.length !== 1 || spokenWords.length !== 1) return false

  const expectedWord = expectedWords[0]
  const spokenWord = spokenWords[0]
  if (!expectedWord || !spokenWord) return false
  if (expectedWord.length > 5 || spokenWord.length > 5) return false
  if (textScore < 0.5) return false
  if (expectedWord[0] !== spokenWord[0]) return false

  return (
    normalizeLiquidConsonants(getConsonantSkeleton(expectedWord)) ===
    normalizeLiquidConsonants(getConsonantSkeleton(spokenWord))
  )
}

function hasMainPhrasePart(expected: string, spoken: string): boolean {
  const mainPart = expected
    .split(' ')
    .filter((token) => token.length >= 4)
    .sort((a, b) => b.length - a.length)[0]

  return !!mainPart && spoken.split(' ').includes(mainPart)
}

function getDecisionRank(reason: SpeechDecisionReason): number {
  switch (reason) {
    case 'exact-text':
      return 6
    case 'dictionary-homophone':
      return 5
    case 'phonetic-code':
      return 4
    case 'consonant-skeleton':
      return 3
    case 'text-similarity':
      return 2
    case 'phrase-main-part':
      return 1
    case 'close':
      return 0
    case 'retry':
      return -1
  }
}

function getRawTranscripts(spoken: string | string[]): string[] {
  return (Array.isArray(spoken) ? spoken : [spoken]).filter(Boolean)
}

function getDisplayScore(score: number, isPass: boolean): number {
  const normalizedScore = Math.round(score / 10)

  if (isPass) return Math.min(10, Math.max(7, normalizedScore))

  return Math.min(6, Math.max(1, normalizedScore))
}

function analyzeCandidate(
  expected: string,
  candidate: string,
  passThreshold: number,
): SpeechCandidateDebug {
  const matchRatio = similarity(expected, candidate)
  const score = Math.round(matchRatio * 100)
  const isExact = expected === candidate
  const phoneticReason = getPhoneticReason(expected, candidate, matchRatio)
  const isTextPass = canPassByTextSimilarity(
    expected,
    candidate,
    matchRatio,
    passThreshold,
  )
  const isConsonantSkeletonPass = canPassByConsonantSkeleton(
    expected,
    candidate,
    matchRatio,
  )
  const isPhrasePass =
    expected.includes(' ') && hasMainPhrasePart(expected, candidate)
  const isStrictPass =
    isExact ||
    !!phoneticReason ||
    isConsonantSkeletonPass ||
    isTextPass ||
    isPhrasePass
  const isClose = !isStrictPass && matchRatio >= passThreshold - 0.15
  const isPass = isStrictPass || isClose
  const reason: SpeechDecisionReason = isExact
    ? 'exact-text'
    : (phoneticReason ??
      (isConsonantSkeletonPass
        ? 'consonant-skeleton'
        : isTextPass
          ? 'text-similarity'
          : isPhrasePass
            ? 'phrase-main-part'
            : isClose
              ? 'close'
              : 'retry'))

  return {
    transcript: candidate,
    score,
    matchRatio,
    reason,
    isPass,
    isClose,
    isExact,
    isPhoneticMatch: phoneticReason !== null,
    isTextPass,
    isPhrasePass,
    dictionaryPronunciations: getDictionaryPronunciations(candidate),
    phoneticCodes: getPhoneticCodes(candidate),
    consonantSkeleton: getConsonantSkeleton(candidate),
    vowelSkeleton: getVowelSkeleton(candidate),
  }
}

function pickBestCandidate(
  candidates: SpeechCandidateDebug[],
): SpeechCandidateDebug {
  return candidates.reduce((best, candidate) => {
    const bestRank = getDecisionRank(best.reason)
    const candidateRank = getDecisionRank(candidate.reason)
    if (candidateRank !== bestRank) {
      return candidateRank > bestRank ? candidate : best
    }
    if (candidate.score !== best.score) {
      return candidate.score > best.score ? candidate : best
    }
    return candidate.transcript.length < best.transcript.length
      ? candidate
      : best
  })
}

function buildCandidates(
  expected: string,
  spoken: string | string[],
): string[] {
  const expectedWords = expected.split(' ').filter(Boolean)
  const values = Array.isArray(spoken) ? spoken : [spoken]
  const candidates = new Set<string>()

  for (const value of values) {
    const normalized = normalizeSpeechText(value)
    if (!normalized) continue
    candidates.add(normalized)

    if (expectedWords.length === 1) {
      for (const token of normalized.split(' ').filter(Boolean)) {
        candidates.add(token)
      }
    }
  }

  return [...candidates]
}

export function buildSpeechDiff(
  expected: string,
  spoken: string | string[],
): SpeechDiff {
  const exp = normalizeSpeechText(expected)
  const passThreshold = getPassThreshold(exp)
  const closeThreshold = passThreshold - 0.15
  const candidates = buildCandidates(exp, spoken)
  const candidateDebug =
    candidates.length > 0
      ? candidates.map((candidate) =>
          analyzeCandidate(exp, candidate, passThreshold),
        )
      : [analyzeCandidate(exp, '', passThreshold)]
  const best = pickBestCandidate(candidateDebug)
  const spk = best.transcript

  const dp = buildEditTable(exp, spk)
  const tokens = traceback(dp, exp, spk)

  return {
    tokens,
    score: best.score,
    displayScore: getDisplayScore(best.score, best.isPass),
    matchRatio: best.matchRatio,
    expectedSyllables: countSyllables(exp),
    recognizedSyllables: countSyllables(spk),
    isExact: best.isExact,
    isPass: best.isPass,
    isClose: best.isClose,
    isPhoneticMatch: best.isPhoneticMatch,
    bestTranscript: spk,
    decisionReason: best.reason,
    debug: {
      expected,
      normalizedExpected: exp,
      rawTranscripts: getRawTranscripts(spoken),
      passThreshold,
      closeThreshold,
      expectedDictionaryPronunciations: getDictionaryPronunciations(exp),
      expectedPhoneticCodes: getPhoneticCodes(exp),
      expectedConsonantSkeleton: getConsonantSkeleton(exp),
      expectedVowelSkeleton: getVowelSkeleton(exp),
      candidates: candidateDebug,
      decisionReason: best.reason,
    },
  }
}
