import Groq from 'groq-sdk'

import { BaseAIProvider } from './base.provider'
import {
  ANALYZE_PASSAGE_PROMPT,
  EXTRACT_VOCABULARY_PROMPT,
  buildPassageLookupPrompt,
  buildSynonymCheckPrompt,
  buildTranslationPrompt,
  buildVocabularyFillPrompt,
  buildWritingScorePrompt,
  buildWritingTitlePrompt,
  guessSingularForm,
  parsePassageAnalysis,
  parsePassageWordMap,
  parseVocabularyFillJson,
  parseVocabularyJson,
  parseWritingScoreResult,
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
      model: 'llama-3.3-70b-versatile',
      max_tokens: 32,
      temperature: 0.2,
      messages: [
        { role: 'user', content: buildTranslationPrompt(text, direction) },
      ],
    })
    return res.choices[0]?.message?.content?.trim() ?? ''
  }

  async suggestVocabularyFill(word: string): Promise<VocabularyFill> {
    const fill = await this.requestVocabularyFill(word)
    if (fill.valid) return fill

    const singular = guessSingularForm(word)
    if (!singular) return fill

    return this.requestVocabularyFill(singular)
  }

  private async requestVocabularyFill(word: string): Promise<VocabularyFill> {
    const res = await this.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 256,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: buildVocabularyFillPrompt(word) }],
    })
    const raw = res.choices[0]?.message?.content?.trim() ?? '{}'
    const fill = parseVocabularyFillJson(raw) as Partial<VocabularyFill>
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
    const prompt = buildWritingScorePrompt(keywords, userSentence)

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
    return parseWritingScoreResult(raw)
  }

  async generateWritingTitle(
    imageUrl: string,
    keywords: string[],
  ): Promise<string> {
    const prompt = buildWritingTitlePrompt(keywords)

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
      model: 'llama-3.3-70b-versatile',
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
