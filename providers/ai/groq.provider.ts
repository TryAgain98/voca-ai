import Groq from 'groq-sdk'

import { BaseAIProvider } from './base.provider'
import {
  ANALYZE_PASSAGE_PROMPT,
  EXTRACT_VOCABULARY_PROMPT,
  buildPassageLookupPrompt,
  buildSynonymCheckPrompt,
  buildTranslationPrompt,
  buildVocabularyFillPrompt,
  parsePassageAnalysis,
  parsePassageWordMap,
  parseVocabularyJson,
} from './utils'

import type {
  ExtractedVocabulary,
  PassageAnalysis,
  PassageWordMap,
  TranslationDirection,
  VocabularyFill,
  WritingScoreResult,
} from './types'

export class GroqProvider extends BaseAIProvider {
  readonly name = 'Groq'
  private readonly client: Groq

  constructor() {
    super()
    this.client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }

  async extractVocabulary(
    base64: string,
    mimeType: string,
  ): Promise<ExtractedVocabulary[]> {
    const res = await this.client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: EXTRACT_VOCABULARY_PROMPT },
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
          ],
        },
      ],
    })
    return parseVocabularyJson(res.choices[0]?.message?.content ?? '[]')
  }

  async suggestTranslation(
    text: string,
    direction: TranslationDirection,
  ): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 32,
      temperature: 0.2,
      messages: [
        { role: 'user', content: buildTranslationPrompt(text, direction) },
      ],
    })
    return res.choices[0]?.message?.content?.trim() ?? ''
  }

  async suggestVocabularyFill(word: string): Promise<VocabularyFill> {
    const res = await this.client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 256,
      temperature: 0.2,
      messages: [{ role: 'user', content: buildVocabularyFillPrompt(word) }],
    })
    const raw = res.choices[0]?.message?.content?.trim() ?? '{}'
    const fill = JSON.parse(raw) as Partial<VocabularyFill>
    if (fill.valid === false) {
      return { valid: false, meaning: '', phonetic: '', example: '' }
    }
    return {
      valid: true,
      word_type: String(fill.word_type ?? ''),
      meaning: String(fill.meaning ?? ''),
      phonetic: String(fill.phonetic ?? ''),
      example: String(fill.example ?? ''),
      description: fill.description ? String(fill.description) : undefined,
    }
  }

  async transcribeAudio(file: File): Promise<string> {
    const transcription = await this.client.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3',
      language: 'en',
      temperature: 0,
    })
    return transcription.text
  }

  async analyzePassage(
    input: { text: string } | { base64: string; mimeType: string },
  ): Promise<PassageAnalysis> {
    const res = await this.client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content:
            'text' in input
              ? `${ANALYZE_PASSAGE_PROMPT}\n\nPassage:\n${input.text}`
              : [
                  { type: 'text' as const, text: ANALYZE_PASSAGE_PROMPT },
                  {
                    type: 'image_url' as const,
                    image_url: {
                      url: `data:${input.mimeType};base64,${input.base64}`,
                    },
                  },
                ],
        },
      ],
    })
    return parsePassageAnalysis(res.choices[0]?.message?.content ?? '{}')
  }

  async checkSynonyms(
    wordA: string,
    typeA: string | null,
    meaningA: string,
    wordB: string,
    typeB: string | null,
    meaningB: string,
  ): Promise<boolean> {
    const res = await this.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 5,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: buildSynonymCheckPrompt(
            wordA,
            typeA,
            meaningA,
            wordB,
            typeB,
            meaningB,
          ),
        },
      ],
    })
    const answer = res.choices[0]?.message?.content?.trim().toLowerCase() ?? ''
    return answer.startsWith('yes')
  }

  async scoreWriting(
    imageUrl: string,
    keywords: string[],
    userSentence: string,
  ): Promise<WritingScoreResult> {
    const prompt = `You are an English writing coach for Vietnamese learners (A2-B1 level).

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

    const res = await this.client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 1024,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
    })
    const raw = res.choices[0]?.message?.content?.trim() ?? '{}'
    const result = JSON.parse(raw) as WritingScoreResult
    if (Array.isArray(result.grammar_errors)) {
      result.grammar_errors = result.grammar_errors.filter(
        (e) => !!e.wrong && !!e.fix && e.wrong.trim() !== e.fix.trim(),
      )
    }
    return result
  }

  async generateWritingTitle(
    imageUrl: string,
    keywords: string[],
  ): Promise<string> {
    const prompt = `Look at this image and keywords: [${keywords.join(', ')}].
Generate a short, descriptive English title (5-8 words) for a writing exercise about this image.
Respond with ONLY the title text, nothing else.`

    const res = await this.client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
    })
    const text = res.choices[0]?.message?.content?.trim() ?? ''
    return text.replace(/^["']|["']$/g, '')
  }

  async lookupPassageWords(passageText: string): Promise<PassageWordMap> {
    const res = await this.client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 8192,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'user', content: buildPassageLookupPrompt(passageText) },
      ],
    })
    const raw = res.choices[0]?.message?.content?.trim() ?? '{}'
    return parsePassageWordMap(raw)
  }
}
