import { NextResponse } from 'next/server'

import { AnthropicProvider, GeminiProvider, GroqProvider } from '~/providers/ai'

import type { PassageAnalysis } from '~/providers/ai/types'

const providers = [
  new GroqProvider(),
  new GeminiProvider(),
  new AnthropicProvider(),
]

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

    let input: { text: string } | { base64: string; mimeType: string }

    if (text) {
      input = { text }
    } else {
      const bytes = await image!.arrayBuffer()
      input = {
        base64: Buffer.from(bytes).toString('base64'),
        mimeType: image!.type,
      }
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
