import type {
  ExtractedVocabulary,
  PassageAnalysis,
  PassageWordMap,
  SuggestedPassageVocab,
  TranslationDirection,
} from './types'

export const EXTRACT_VOCABULARY_PROMPT = `You are an English–Vietnamese dictionary. Extract all vocabulary words from this image.

For each word, return:
- word: the English word exactly as shown
- word_type: part of speech (n, v, adj, adv, prep, conj, pron, etc.)
- phonetic: IPA transcription (e.g. /riːd/) — use your dictionary knowledge if not shown in the image
- meaning: Vietnamese meaning (1–5 words) — give the most precise primary translation matching the word's part of speech and the context visible in the image. Be specific: prefer "khu phức hợp" over "tòa nhà" for complex (n), "tính năng" over "đặc điểm" for feature (n) in a tech context, etc. Never use an overly broad or generic translation.
- example: a natural English example sentence consistent with the word_type — use your dictionary knowledge if not shown in the image
- description: a short Vietnamese explanation of the word's nuance or usage, especially useful for words that are easily confused with similar words (e.g. see vs look vs watch, make vs do). Keep it under 2 sentences.

Fill every field using your knowledge as an English–Vietnamese dictionary. Never leave a field empty.

Return a JSON array in this exact format. Use ONLY double quotes for all strings. No single quotes, no markdown, no explanation:
[
  {
    "word": "read",
    "word_type": "v",
    "phonetic": "/riːd/",
    "meaning": "đọc",
    "example": "She reads a book every night.",
    "description": "Chỉ hành động đọc chữ hoặc thông tin từ văn bản, tài liệu."
  }
]`

export function buildTranslationPrompt(
  text: string,
  direction: TranslationDirection,
): string {
  if (direction === 'word-to-meaning') {
    return `You are a bilingual English-Vietnamese dictionary. Given the English word or phrase "${text}", provide the Vietnamese meaning in 1-6 words. Return ONLY the Vietnamese meaning, no explanation, no punctuation at the end.`
  }
  return `You are a bilingual English-Vietnamese dictionary. Given the Vietnamese meaning "${text}", suggest the most fitting English word or short phrase. Return ONLY the English word or phrase, nothing else.`
}

export function buildVocabularyFillPrompt(word: string): string {
  return `You are an English-Vietnamese dictionary. Given the input "${word}":
- If it IS a real English word or phrase, return exactly: {"valid":true,"word_type":"<part of speech: n|v|adj|adv|prep|prep phr.|phr.v|p.p|phrase>","meaning":"<Vietnamese, 1-6 words>","phonetic":"</IPA/>","example":"<natural English sentence>"}
- If it is NOT a real English word, return exactly: {"valid":false}

Return ONLY valid JSON, no markdown, no explanation.`
}

export function buildSynonymCheckPrompt(
  wordA: string,
  typeA: string | null,
  meaningA: string,
  wordB: string,
  typeB: string | null,
  meaningB: string,
): string {
  const labelA = typeA ? `${wordA} (${typeA})` : wordA
  const labelB = typeB ? `${wordB} (${typeB})` : wordB
  return `Do "${labelA}" (${meaningA}) and "${labelB}" (${meaningB}) mean the EXACT same thing and can fully replace each other in any sentence? Must be same part of speech. "near the X" vs "near the Y" = no. Related but different = no. Reply ONLY "yes" or "no".`
}

export function parseVocabularyJson(raw: string): ExtractedVocabulary[] {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
    // Fix single-quoted JSON values (e.g. "phonetic": '/riːd/' → "phonetic": "/riːd/")
    .replace(/: '([^']*)'/g, ': "$1"')

  try {
    return JSON.parse(cleaned) as ExtractedVocabulary[]
  } catch {
    return recoverTruncatedVocabularyJson(cleaned)
  }
}

function recoverTruncatedVocabularyJson(raw: string): ExtractedVocabulary[] {
  const arrayStart = raw.indexOf('[')
  if (arrayStart === -1) throw new Error('No JSON array found in AI response')

  const lastObjectEnd = raw.lastIndexOf('}')
  if (lastObjectEnd === -1 || lastObjectEnd < arrayStart) {
    throw new Error('No complete vocabulary entries in AI response')
  }

  const recovered = `${raw.slice(arrayStart, lastObjectEnd + 1)}]`
  return JSON.parse(recovered) as ExtractedVocabulary[]
}

export function buildPassageLookupPrompt(passageText: string): string {
  return `You are a vocabulary assistant for Vietnamese English learners.

Read this English passage and identify every vocabulary unit worth knowing:

"${passageText}"

Rules for identifying units:
- Hyphenated compounds are ONE unit: state-of-the-art, well-known, up-to-date, co-founder
- Phrasal verbs are ONE unit: give up, look after, break down, take off
- Include all content words: nouns, verbs, adjectives, adverbs, prepositions with non-literal meaning
- Exclude pure function words: a, an, the, is, are, was, were, be, been, being, I, you, he, she, it, we, they, me, him, her, us, them, and, but, or, so, yet, nor

For each unit provide:
- "meaning": Vietnamese meaning in this specific context (1–5 words). null only for the excluded function words above.
- "ipa": IPA transcription for single words and hyphenated compounds. null for space-separated phrases.

Return ONLY valid JSON — lowercase keys matching exact text in the passage, no markdown:
{"state-of-the-art": {"meaning": "tiên tiến nhất", "ipa": "/ˌsteɪt.əv.ðəˈɑːrt/"}, "rapidly": {"meaning": "nhanh chóng", "ipa": "/ˈræp.ɪd.li/"}, "give up": {"meaning": "từ bỏ", "ipa": null}}`
}

export const ANALYZE_PASSAGE_PROMPT = `You are an English language teacher. Analyze the English passage provided and return a single JSON object with these fields:

- content: the exact original English passage text (copy verbatim if provided as text; transcribe faithfully if from image)
- title: a short English title (5-10 words) summarizing the passage
- translation: full Vietnamese translation of the passage (natural, fluent)
- time_good: target seconds for reading aloud clearly at a good, fluent learner pace (benchmark: ~140 wpm)
- suggested_vocabulary: Extract EVERY content word from the passage mechanically. Include ALL nouns, ALL verbs (except to-be), ALL adjectives, ALL adverbs. Do NOT skip words because they seem common or easy — if it is a noun/verb/adj/adv and not in the exclude list, it MUST be included. When in doubt, include it.

  EXCLUDE ONLY these exact categories: to-be verbs (is, are, was, were, am, be, been, being), personal pronouns (I, you, he, she, it, we, they, me, him, her, us, them), articles (a, an, the), demonstratives (this, that, these, those), basic prepositions (in, on, at, to, for, of, by, with, from, into, onto, about, above, below, between, through, during, before, after), coordinating/subordinating conjunctions (and, but, or, so, yet, nor, although, because, since, while, when, if, that), numbers, possessives (my, your, his, her, its, our, their).

  Example: for the passage "The new office complex offers state-of-the-art facilities for tenants", ALL of these must be included: new, office, complex, offers, state-of-the-art, facilities, tenants.

  Each entry: {"word":"...","word_type":"<n|v|adj|adv|prep|...>","phonetic":"/IPA/","meaning":"Vietnamese meaning (1-6 words)","example":"natural English sentence","description":"short Vietnamese usage note, especially for easily confused words"}

Return ONLY valid JSON, no markdown fences, no explanation.`

export function parsePassageWordMap(raw: string): PassageWordMap {
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  const start = stripped.indexOf('{')
  if (start === -1) throw new Error('No JSON object in AI response')
  const end = stripped.lastIndexOf('}')
  if (end === -1 || end < start)
    throw new Error('Malformed JSON in AI response')

  return JSON.parse(stripped.slice(start, end + 1)) as PassageWordMap
}

function cleanJson(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

export function parsePassageAnalysis(raw: string): PassageAnalysis {
  const cleaned = cleanJson(raw)
  const parsed = JSON.parse(cleaned) as Partial<PassageAnalysis>

  const suggested = (parsed.suggested_vocabulary ??
    []) as SuggestedPassageVocab[]

  return {
    content: String(parsed.content ?? ''),
    title: String(parsed.title ?? ''),
    translation: String(parsed.translation ?? ''),
    time_good: Number(parsed.time_good ?? 0),
    suggested_vocabulary: suggested,
  }
}
