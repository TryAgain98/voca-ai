import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

interface ExtractedVocabulary {
  word: string
  word_type: string
  phonetic: string
  meaning: string
  example: string
  description: string
}

const PROMPT = `You are an English dictionary. Extract all vocabulary words from this image.

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

function parseJson(raw: string): ExtractedVocabulary[] {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
  return JSON.parse(cleaned)
}

async function extractWithGemini(
  base64: string,
  mimeType: string,
): Promise<ExtractedVocabulary[]> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent([
    PROMPT,
    { inlineData: { mimeType, data: base64 } },
  ])
  return parseJson(result.response.text())
}

async function extractWithOpenAI(
  base64: string,
  mimeType: string,
): Promise<ExtractedVocabulary[]> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64}` },
          },
        ],
      },
    ],
  })
  return parseJson(res.choices[0]?.message?.content ?? '[]')
}

async function extractWithAnthropic(
  base64: string,
  mimeType: string,
): Promise<ExtractedVocabulary[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType as
                | 'image/jpeg'
                | 'image/png'
                | 'image/gif'
                | 'image/webp',
              data: base64,
            },
          },
          { type: 'text', text: PROMPT },
        ],
      },
    ],
  })
  const text = res.content[0].type === 'text' ? res.content[0].text : '[]'
  return parseJson(text)
}

async function extractWithGroq(
  base64: string,
  mimeType: string,
): Promise<ExtractedVocabulary[]> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const res = await client.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64}` },
          },
        ],
      },
    ],
  })
  return parseJson(res.choices[0]?.message?.content ?? '[]')
}

const providers = [
  { name: 'Groq', fn: extractWithGroq },
  { name: 'Gemini', fn: extractWithGemini },
  { name: 'OpenAI', fn: extractWithOpenAI },
  { name: 'Anthropic', fn: extractWithAnthropic },
]

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File | null
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const bytes = await image.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = image.type

    const errors: string[] = []
    for (const { name, fn } of providers) {
      try {
        const vocabularies = await fn(base64, mimeType)
        return NextResponse.json({ vocabularies, provider: name })
      } catch (err) {
        errors.push(`${name}: ${err instanceof Error ? err.message : 'failed'}`)
      }
    }

    return NextResponse.json(
      { error: `All providers failed:\n${errors.join('\n')}` },
      { status: 500 },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
