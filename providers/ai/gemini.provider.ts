import { GoogleGenerativeAI } from '@google/generative-ai'

import { BaseAIProvider } from './base.provider'
import {
  ANALYZE_PASSAGE_PROMPT,
  EXTRACT_VOCABULARY_PROMPT,
  buildPassageLookupPrompt,
  buildWritingScorePrompt,
  buildWritingTitlePrompt,
  parsePassageAnalysis,
  parseVocabularyJson,
  parseWritingScoreResult,
} from './utils'

import type {
  ExtractedVocabulary,
  PassageAnalysis,
  PassageWordMap,
  WritingScoreResult,
} from './types'

async function fetchImageAsBase64(
  imageUrl: string,
): Promise<{ base64: string; mimeType: string }> {
  const res = await fetch(imageUrl)
  if (!res.ok) {
    throw new Error(`Failed to fetch image (${res.status})`)
  }
  const buffer = await res.arrayBuffer()
  return {
    base64: Buffer.from(buffer).toString('base64'),
    mimeType: res.headers.get('content-type') ?? 'image/jpeg',
  }
}

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
    const model = this.client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    })
    const result = await model.generateContent([
      EXTRACT_VOCABULARY_PROMPT,
      { inlineData: { mimeType, data: base64 } },
    ])
    return parseVocabularyJson(result.response.text())
  }

  async lookupPassageWords(passageText: string): Promise<PassageWordMap> {
    const model = this.client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    })
    const result = await model.generateContent(
      buildPassageLookupPrompt(passageText),
    )
    return JSON.parse(result.response.text()) as PassageWordMap
  }

  async analyzePassage(
    input: { text: string } | { base64: string; mimeType: string },
  ): Promise<PassageAnalysis> {
    const model = this.client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    })
    const result = await model.generateContent(
      'text' in input
        ? `${ANALYZE_PASSAGE_PROMPT}\n\nPassage:\n${input.text}`
        : [
            ANALYZE_PASSAGE_PROMPT,
            {
              inlineData: { mimeType: input.mimeType, data: input.base64 },
            },
          ],
    )
    return parsePassageAnalysis(result.response.text())
  }

  async scoreWriting(
    imageUrl: string,
    keywords: string[],
    userSentence: string,
  ): Promise<WritingScoreResult> {
    const { base64, mimeType } = await fetchImageAsBase64(imageUrl)
    const model = this.client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    })
    const result = await model.generateContent([
      buildWritingScorePrompt(keywords, userSentence),
      { inlineData: { mimeType, data: base64 } },
    ])
    return parseWritingScoreResult(result.response.text())
  }

  async generateWritingTitle(
    imageUrl: string,
    keywords: string[],
  ): Promise<string> {
    const { base64, mimeType } = await fetchImageAsBase64(imageUrl)
    const model = this.client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { maxOutputTokens: 50 },
    })
    const result = await model.generateContent([
      buildWritingTitlePrompt(keywords),
      { inlineData: { mimeType, data: base64 } },
    ])
    return result.response
      .text()
      .trim()
      .replace(/^["']|["']$/g, '')
  }
}
