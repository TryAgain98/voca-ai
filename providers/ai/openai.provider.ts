import OpenAI from 'openai'

import { BaseAIProvider } from './base.provider'
import {
  EXTRACT_VOCABULARY_PROMPT,
  buildTranslationPrompt,
  parseVocabularyJson,
} from './utils'

import type { ExtractedVocabulary, TranslationDirection } from './types'

export class OpenAIProvider extends BaseAIProvider {
  readonly name = 'OpenAI'
  private readonly client: OpenAI

  constructor() {
    super()
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }

  async extractVocabulary(
    base64: string,
    mimeType: string,
  ): Promise<ExtractedVocabulary[]> {
    const res = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
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
      model: 'gpt-4o-mini',
      max_tokens: 32,
      temperature: 0.2,
      messages: [
        { role: 'user', content: buildTranslationPrompt(text, direction) },
      ],
    })
    return res.choices[0]?.message?.content?.trim() ?? ''
  }
}
