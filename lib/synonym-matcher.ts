const VI_STOP_WORDS = new Set([
  'là',
  'có',
  'của',
  'và',
  'hoặc',
  'để',
  'trong',
  'khi',
  'với',
  'một',
  'các',
  'những',
  'được',
  'không',
  'nhiều',
  'về',
  'cho',
  'từ',
  'theo',
  'đến',
  'trên',
  'dưới',
  'tại',
  'vào',
  'ra',
  'lên',
  'xuống',
  'này',
  'đó',
  'the',
  'a',
  'an',
  'of',
  'to',
  'in',
  'is',
  'are',
  'or',
  'and',
  'for',
])

export interface SynonymCandidate {
  id: string
  word: string
  word_type: string | null
  meaning: string
  synonyms: string[]
}

export function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function tokenize(meaning: string): Set<string> {
  return new Set(
    normalize(meaning)
      .split(/[\s,;.()/]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 2 && !VI_STOP_WORDS.has(t)),
  )
}

function sharedCount(a: Set<string>, b: Set<string>): number {
  let count = 0
  for (const token of a) {
    if (b.has(token)) count++
  }
  return count
}

function overlapScore(a: Set<string>, b: Set<string>, shared: number): number {
  const minSize = Math.min(a.size, b.size)
  return minSize === 0 ? 0 : shared / minSize
}

const VERB_TYPES = new Set([
  'v',
  'vi',
  'vt',
  'p.p',
  'pp',
  'past participle',
  'phrasal verb',
  'phr.v',
])
const NOUN_TYPES = new Set(['n', 'noun', 'n.p', 'np', 'plural noun'])
const ADJ_TYPES = new Set(['adj', 'adjective'])
const ADV_TYPES = new Set(['adv', 'adverb'])

function typeGroup(type: string): string {
  if (VERB_TYPES.has(type)) return 'verb'
  if (NOUN_TYPES.has(type)) return 'noun'
  if (ADJ_TYPES.has(type)) return 'adj'
  if (ADV_TYPES.has(type)) return 'adv'
  return type
}

export function findCandidates(
  target: SynonymCandidate,
  pool: SynonymCandidate[],
): SynonymCandidate[] {
  const targetTokens = tokenize(target.meaning)
  const targetType = target.word_type
    ? typeGroup(normalize(target.word_type))
    : null
  const targetWordNorm = normalize(target.word)

  return pool.filter((v) => {
    if (v.id === target.id) return false
    if (normalize(v.word) === targetWordNorm) return false
    if (target.synonyms.includes(normalize(v.word))) return false

    const vType = v.word_type ? typeGroup(normalize(v.word_type)) : null
    if (targetType && vType && targetType !== vType) return false

    const vTokens = tokenize(v.meaning)
    const shared = sharedCount(targetTokens, vTokens)
    return shared >= 2 && overlapScore(targetTokens, vTokens, shared) >= 0.5
  })
}
