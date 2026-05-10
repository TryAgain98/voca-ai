/**
 * Answer pattern + collision detection for typing exercises.
 *
 * Solves: vocab with same Vietnamese meaning (e.g. "be set" / "be laid out"
 * both mean "được sắp xếp"). Pattern hint disambiguates which exact term the
 * card wants. When two siblings happen to share an identical pattern, both
 * are accepted (collision) since the hint cannot distinguish them.
 */

const WHITESPACE_RE = /\s+/g

export function normalizeAnswer(input: string): string {
  return input.trim().toLowerCase().replace(WHITESPACE_RE, ' ')
}

function splitWords(term: string): string[] {
  return normalizeAnswer(term).split(' ').filter(Boolean)
}

export function getPattern(term: string): string {
  return splitWords(term)
    .map((w) => '_'.repeat(w.length))
    .join('   ')
}

export function getFirstLetterHint(term: string): string {
  return splitWords(term)
    .map((w) => (w.length <= 1 ? w : w[0] + '_'.repeat(w.length - 1)))
    .join('   ')
}

interface PatternKey {
  count: number
  lengths: number[]
  firstLetters: string[]
}

function getPatternKey(term: string): PatternKey {
  const words = splitWords(term)
  return {
    count: words.length,
    lengths: words.map((w) => w.length),
    firstLetters: words.map((w) => w[0] ?? ''),
  }
}

function patternMatches(a: PatternKey, b: PatternKey): boolean {
  if (a.count !== b.count) return false
  for (let i = 0; i < a.count; i++) {
    if (a.lengths[i] !== b.lengths[i]) return false
    if (a.firstLetters[i] !== b.firstLetters[i]) return false
  }
  return true
}

interface CollidableVocab {
  id: string
  word: string
  meaning: string
  synonyms: string[]
}

export function findSiblings<T extends CollidableVocab>(
  card: T,
  pool: T[],
): T[] {
  const cardMeaning = normalizeAnswer(card.meaning)
  return pool.filter(
    (v) => v.id !== card.id && normalizeAnswer(v.meaning) === cardMeaning,
  )
}

export type AnswerVerdict =
  | { kind: 'correct' }
  | { kind: 'synonym' }
  | { kind: 'collision'; matched: CollidableVocab }
  | { kind: 'wrong' }

export function checkAnswer<T extends CollidableVocab>(
  card: T,
  userInput: string,
  siblings: T[],
): AnswerVerdict {
  const input = normalizeAnswer(userInput)
  if (!input) return { kind: 'wrong' }
  if (input === normalizeAnswer(card.word)) return { kind: 'correct' }

  for (const syn of card.synonyms) {
    if (input === normalizeAnswer(syn)) return { kind: 'synonym' }
  }

  const cardKey = getPatternKey(card.word)
  for (const sibling of siblings) {
    if (input !== normalizeAnswer(sibling.word)) continue
    if (patternMatches(cardKey, getPatternKey(sibling.word))) {
      return { kind: 'collision', matched: sibling }
    }
  }
  return { kind: 'wrong' }
}
