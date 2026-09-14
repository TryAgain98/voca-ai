import { NextResponse } from 'next/server'

import { AnthropicProvider, GeminiProvider, GroqProvider } from '~/providers/ai'

import type { BaseAIProvider } from '~/providers/ai'
import type { PassageAnalysis } from '~/providers/ai/types'

const groq = new GroqProvider()
const gemini = new GeminiProvider()
const anthropic = new AnthropicProvider()

const TEXT_PROVIDERS = [groq, gemini, anthropic]
// Groq's vision model shares a small free-tier output-per-minute budget and 429s
// once it is drained, so Gemini leads on the image path and Groq backs it up.
const IMAGE_PROVIDERS = [gemini, groq, anthropic]

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const formData = await req.formData()
    const text = formData.get('text') as string | null
    const image = formData.get('image') as File | null

    if (!text && !image) {
      return NextResponse.json(
        { error: 'Provide either text or image' },
        { status: 400 },
      )
    }

    if (!text && image!.size === 0) {
      return NextResponse.json(
        { error: 'Image file is empty' },
        { status: 400 },
      )
    }

    let input: { text: string } | { base64: string; mimeType: string }
    let providers: BaseAIProvider[]

    if (text) {
      input = { text }
      providers = TEXT_PROVIDERS
    } else {
      const bytes = await image!.arrayBuffer()
      input = {
        base64: Buffer.from(bytes).toString('base64'),
        mimeType: image!.type,
      }
      providers = IMAGE_PROVIDERS
    }

    const errors: string[] = []
    let result: PassageAnalysis | null = null

    for (const provider of providers) {
      try {
        result = await provider.analyzePassage(input)
        break
      } catch (err) {
        errors.push(
          `${provider.name}: ${err instanceof Error ? err.message : 'failed'}`,
        )
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: `All providers failed:\n${errors.join('\n')}` },
        { status: 500 },
      )
    }

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
