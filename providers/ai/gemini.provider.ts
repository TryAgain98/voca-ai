import { GoogleGenerativeAI } from '@google/generative-ai'

import { BaseAIProvider } from './base.provider'
import { EXTRACT_VOCABULARY_PROMPT, parseVocabularyJson } from './utils'

import type { ExtractedVocabulary } from './types'

export class GeminiProvider extends BaseAIProvider {
  readonly name = 'Gemini'
  private readonly client: GoogleGenerativeAI

  constructor() {
    super()
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  }

  async extractVocabulary(
    base64: string,
    mimeType: string,
  ): Promise<ExtractedVocabulary[]> {
    const model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent([
      EXTRACT_VOCABULARY_PROMPT,
      { inlineData: { mimeType, data: base64 } },
    ])
    return parseVocabularyJson(result.response.text())
  }
}
