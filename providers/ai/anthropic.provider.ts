import Anthropic from '@anthropic-ai/sdk'

import { BaseAIProvider } from './base.provider'
import { EXTRACT_VOCABULARY_PROMPT, parseVocabularyJson } from './utils'

import type { ExtractedVocabulary } from './types'

const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number]

export class AnthropicProvider extends BaseAIProvider {
  readonly name = 'Anthropic'
  private readonly client: Anthropic

  constructor() {
    super()
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }

  async extractVocabulary(
    base64: string,
    mimeType: string,
  ): Promise<ExtractedVocabulary[]> {
    const mediaType = SUPPORTED_MIME_TYPES.includes(
      mimeType as SupportedMimeType,
    )
      ? (mimeType as SupportedMimeType)
      : 'image/jpeg'

    const res = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            { type: 'text', text: EXTRACT_VOCABULARY_PROMPT },
          ],
        },
      ],
    })
    const text = res.content[0].type === 'text' ? res.content[0].text : '[]'
    return parseVocabularyJson(text)
  }
}
