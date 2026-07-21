import type {
  ExtractedVocabulary,
  PassageAnalysis,
  PassageWordMap,
  SuggestedPassageVocab,
  TranslationDirection,
  WritingScoreResult,
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
- If it IS a real English word or phrase, return exactly: {"valid":true,"word_type":"<part of speech: n|v|adj|adv|prep|prep phr.|phr.v|p.p|phrase>","meaning":"<Vietnamese, 1-6 words>","phonetic":"</IPA/>","example":"<natural English sentence>","description":"<1 Vietnamese sentence, max 12 words: describe WHAT the word specifically means or when to use it — must be concrete and accurate for THIS word, not generic. No English. Do not restate the meaning.>"}
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
  const cleaned = cleanJson(raw)
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

export function buildStoryPassagePrompt(
  genre: string,
  words: { word: string; meaning: string }[],
): string {
  const wordList = words.map((w) => `- ${w.word} (${w.meaning})`).join('\n')
  return `You are a creative English writing assistant for Vietnamese learners.

Write EXACTLY 3-4 sentences (~60-70 words) in the "${genre}" genre. Naturally use ALL of these words:
${wordList}

Rules:
- Use only simple everyday English for everything else.
- Each target word must appear exactly once, used naturally.
- Make it fun and match the genre tone.

Return ONLY valid JSON (no markdown, no explanation):
{"passage": "<English passage>", "translation": "<Full Vietnamese translation of the passage, natural and fluent>"}`
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

  Each entry: {"word":"...","word_type":"<n|v|adj|adv|prep|...>","phonetic":"/IPA/","meaning":"Vietnamese meaning (1-6 words)","example":"natural English sentence","description":"Exactly 1 Vietnamese sentence (10–20 words) explaining what the word means conceptually. ZERO English words. Must NOT repeat the meaning field. Describe the action (verbs), quality (adjectives), manner (adverbs), or thing (nouns) in plain Vietnamese."}
  Good description examples: "welcome" → "Hành động đón tiếp người khác với thái độ thân thiện, khiến họ cảm thấy thoải mái khi đến." | "office" → "Nơi làm việc trong tòa nhà, dùng để xử lý công việc hành chính hoặc chuyên môn." | "excited" → "Trạng thái phấn khích, háo hức khi mong chờ điều gì đó vui sắp xảy ra." | "hesitate" → "Cảm giác do dự, lưỡng lự khi chưa dám quyết định thực hiện điều gì đó."

Fill every field. Never leave any field empty.

Return ONLY valid JSON, no markdown fences, no explanation.`

export function parsePassageWordMap(raw: string): PassageWordMap {
  return extractJsonObject(raw) as PassageWordMap
}

function extractJsonObject(raw: string): Record<string, unknown> {
  const stripped = cleanJson(raw)

  const start = stripped.indexOf('{')
  if (start === -1) throw new Error('No JSON object in AI response')
  const end = stripped.lastIndexOf('}')
  if (end === -1 || end < start)
    throw new Error('Malformed JSON in AI response')

  return JSON.parse(stripped.slice(start, end + 1)) as Record<string, unknown>
}

export function parseVocabularyFillJson(raw: string): Record<string, unknown> {
  return extractJsonObject(raw)
}

export function guessSingularForm(word: string): string | null {
  const trimmed = word.trim()
  if (/ies$/i.test(trimmed) && trimmed.length > 4) {
    return `${trimmed.slice(0, -3)}y`
  }
  if (/(ses|xes|zes|ches|shes)$/i.test(trimmed)) {
    return trimmed.slice(0, -2)
  }
  if (/s$/i.test(trimmed) && !/ss$/i.test(trimmed) && trimmed.length > 3) {
    return trimmed.slice(0, -1)
  }
  return null
}

function cleanJson(raw: string): string {
  return raw
    .replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

export function buildWritingScorePrompt(
  keywords: string[],
  userSentence: string,
): string {
  return `You are an English writing coach for Vietnamese learners (A2-B1 level).

Image keywords: [${keywords.join(', ')}]
Student's sentence: "${userSentence}"

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "grammar_score": <0-100>,
  "grammar_errors": [
    {
      "wrong": "<exact wrong word or short phrase from the sentence>",
      "fix": "<corrected word or phrase>",
      "reason": {
        "en": "<one short reason, e.g. 'subject-verb agreement: 3rd person singular needs -s'>",
        "vi": "<same reason in Vietnamese>"
      }
    }
  ],
  "grammar_feedback": {
    "en": "<if no errors: one praise sentence. If errors: brief overall summary in one sentence>",
    "vi": "<same in Vietnamese>"
  },
  "relevance_score": <0-100, based ONLY on keyword usage: all keywords used = 100, missing keywords reduce the score proportionally>,
  "relevance_feedback": {
    "en": "<one sentence: list which keywords were used and which (if any) were missing>",
    "vi": "<same in Vietnamese>"
  },
  "improved_sentence": "<student's sentence with only grammar fixed, keeping their vocabulary and style>",
  "ideal_sentence": "<8-12 words, use only simple A1-B1 everyday words like go/walk/read/sit/happy/eat, naturally describes the image using the keywords>",
  "ideal_sentence_vi": "<Vietnamese translation of ideal_sentence>"
}

Rules:
- grammar_errors: MUST be [] if the sentence is grammatically correct.
- CRITICAL: "wrong" must be the EXACT substring from the student's sentence (copy it verbatim). "fix" must be the minimum correct replacement — you may add a word only when it is grammatically required (e.g. a missing article or auxiliary verb). Never rewrite more than the smallest broken unit.
- CRITICAL: Before adding any grammar error, verify that "wrong" and "fix" are actually DIFFERENT strings. If they would be identical, do NOT add that error.
- CRITICAL: A sentence that already starts with "A", "An", or "The" has an article — never flag it as "missing article/determiner".
- CRITICAL: Do NOT flag preposition style preferences (e.g. "on a chair" vs "at a chair") — these are NOT grammar errors for A2-B1 level.
- CRITICAL: Do NOT flag missing vocabulary, missing details, or incomplete descriptions. Grammar scoring is about sentence structure only — not about whether the student described the image fully.
- CRITICAL: Only flag these specific grammar error types:
  1. Wrong verb tense (e.g. "she go yesterday" → "she went")
  2. Wrong verb form (e.g. "she is eat" → "she is eating")
  3. Broken subject-verb agreement (e.g. "she see" → "she sees")
  4. Wrong verb choice that breaks grammar (e.g. "sees out" → "looks out" — "look out" is the correct phrasal verb; "see out" is not standard English)
  5. Missing required article before a countable noun (e.g. "out door" → "out the door")
  6. Clearly wrong part of speech (e.g. noun used as verb)
- CRITICAL: Passive voice constructions ("is/are/was/were + past participle", e.g. "is opened by", "was eaten by") are CORRECT grammar. NEVER flag them as wrong verb form. Example: "The window is opened by a girl" is correct passive voice — do NOT suggest "The window is open".
- CRITICAL: Do NOT change "a" or "an" to "the". Using "a/an" (indefinite article) for a non-specific or first-mention noun is always correct. Only flag a missing article when there is NO article at all before a countable noun.
- CRITICAL: Do not invent errors. Only flag real grammatical mistakes visible in the student's sentence.
- reason: must be SHORT (under 10 words in English). Simple language — no linguistic jargon. Target A2-B1 Vietnamese learners.
- ideal_sentence: NO rare words. Prefer: go, walk, sit, eat, read, talk, look, feel, happy, busy, together
- relevance_score: score based ONLY on whether the student used all the given keywords (or their verb forms, e.g. "drawing" counts for "draw"). 100 = all used, deduct proportionally for each missing keyword. Do NOT penalize for inaccurate image description.
- relevance_feedback: state clearly which keywords were used and which were missing. Do not comment on image accuracy.`
}

export function parseWritingScoreResult(raw: string): WritingScoreResult {
  const result = JSON.parse(cleanJson(raw)) as WritingScoreResult
  if (Array.isArray(result.grammar_errors)) {
    result.grammar_errors = result.grammar_errors.filter(
      (e) => !!e.wrong && !!e.fix && e.wrong.trim() !== e.fix.trim(),
    )
  }
  return result
}

export function buildWritingTitlePrompt(keywords: string[]): string {
  return `Look at this image and keywords: [${keywords.join(', ')}].
Generate a short, descriptive English title (5-8 words) for a writing exercise about this image.
Respond with ONLY the title text, nothing else.`
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
