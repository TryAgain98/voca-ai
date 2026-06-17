import Anthropic from '@anthropic-ai/sdk'

import { BaseAIProvider } from './base.provider'
import {
  ANALYZE_PASSAGE_PROMPT,
  EXTRACT_VOCABULARY_PROMPT,
  buildPassageLookupPrompt,
  buildSynonymCheckPrompt,
  parsePassageAnalysis,
  parseVocabularyJson,
} from './utils'

import type {
  ExtractedVocabulary,
  PassageAnalysis,
  PassageWordMap,
  WritingScoreResult,
} from './types'

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
      max_tokens: 8192,
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

  async analyzePassage(
    input: { text: string } | { base64: string; mimeType: string },
  ): Promise<PassageAnalysis> {
    const mediaType = SUPPORTED_MIME_TYPES.includes(
      ('mimeType' in input ? input.mimeType : '') as SupportedMimeType,
    )
      ? (('mimeType' in input ? input.mimeType : '') as SupportedMimeType)
      : 'image/jpeg'

    const content: Anthropic.MessageParam['content'] =
      'text' in input
        ? `${ANALYZE_PASSAGE_PROMPT}\n\nPassage:\n${input.text}`
        : [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: input.base64,
              },
            },
            { type: 'text', text: ANALYZE_PASSAGE_PROMPT },
          ]

    const res = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      messages: [{ role: 'user', content }],
    })
    const text = res.content[0].type === 'text' ? res.content[0].text : '{}'
    return parsePassageAnalysis(text)
  }

  async checkSynonyms(
    wordA: string,
    typeA: string | null,
    meaningA: string,
    wordB: string,
    typeB: string | null,
    meaningB: string,
  ): Promise<boolean> {
    const res = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 5,
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
    const text = res.content[0].type === 'text' ? res.content[0].text : ''
    return text.trim().toLowerCase().startsWith('yes')
  }

  async scoreWriting(
    imageUrl: string,
    keywords: string[],
    userSentence: string,
  ): Promise<WritingScoreResult> {
    const prompt = `You are an English writing evaluator.

Given an image and keywords: [${keywords.join(', ')}]
The user wrote: "${userSentence}"

Evaluate on two criteria and respond ONLY with valid JSON (no markdown, no explanation):
{
  "grammar_score": <0-100>,
  "grammar_feedback": { "en": "<one sentence in English: grammar error or praise>", "vi": "<same sentence in Vietnamese>" },
  "relevance_score": <0-100>,
  "relevance_feedback": { "en": "<one sentence in English: how well it matches the image and keywords>", "vi": "<same sentence in Vietnamese>" },
  "improved_sentence": "<user's sentence with grammar fixed in English, keeping their style>",
  "ideal_sentence": "<an ideal English sentence using the keywords that perfectly describes the image>",
  "ideal_sentence_vi": "<Vietnamese translation of the ideal_sentence>"
}`

    const res = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'url', url: imageUrl },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    })
    const text = res.content[0].type === 'text' ? res.content[0].text : '{}'
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim()
    return JSON.parse(cleaned) as WritingScoreResult
  }

  async generateWritingTitle(
    imageUrl: string,
    keywords: string[],
  ): Promise<string> {
    const prompt = `Look at this image and keywords: [${keywords.join(', ')}].
Generate a short, descriptive English title (5-8 words) for a writing exercise about this image.
Respond with ONLY the title text, nothing else.`

    const res = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'url', url: imageUrl },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    })
    const text = res.content[0].type === 'text' ? res.content[0].text : ''
    return text.trim().replace(/^["']|["']$/g, '')
  }

  async lookupPassageWords(passageText: string): Promise<PassageWordMap> {
    const res = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: buildPassageLookupPrompt(passageText),
        },
      ],
    })
    const text = res.content[0].type === 'text' ? res.content[0].text : '{}'
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim()
    return JSON.parse(cleaned) as PassageWordMap
  }
}
