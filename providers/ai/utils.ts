import type { ExtractedVocabulary, TranslationDirection } from './types'

export const EXTRACT_VOCABULARY_PROMPT = `You are an English dictionary. Extract all vocabulary words from this image.

For each word, return:
- word: the English word exactly as shown
- word_type: part of speech (n, v, adj, adv, prep, conj, pron, etc.)
- phonetic: IPA transcription (e.g. /riːd/) — use your dictionary knowledge if not shown in the image
- meaning: Vietnamese meaning — use your dictionary knowledge if not shown in the image
- example: a natural English example sentence — use your dictionary knowledge if not shown in the image
- description: a short Vietnamese explanation of the word's nuance or usage, especially useful for words that are easily confused with similar words (e.g. see vs look vs watch, make vs do). Keep it under 2 sentences.

Fill every field using your knowledge as an English dictionary. Never leave a field empty.

Return a JSON array in this exact format, no markdown, no explanation:
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
- If it IS a real English word or phrase, return exactly: {"valid":true,"meaning":"<Vietnamese, 1-6 words>","phonetic":"</IPA/>","example":"<natural English sentence>"}
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
  return JSON.parse(cleaned) as ExtractedVocabulary[]
}
