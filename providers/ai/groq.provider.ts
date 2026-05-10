import Groq from 'groq-sdk'

import { BaseAIProvider } from './base.provider'
import {
  EXTRACT_VOCABULARY_PROMPT,
  buildSynonymCheckPrompt,
  buildTranslationPrompt,
  buildVocabularyFillPrompt,
  parseVocabularyJson,
} from './utils'

import type {
  ExtractedVocabulary,
  TranslationDirection,
  VocabularyFill,
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
      max_tokens: 2048,
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
      max_tokens: 128,
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
    }
  }

  async transcribeAudio(file: File): Promise<string> {
    const transcription = await this.client.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3',
      language: 'en',
    })
    return transcription.text
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
}
