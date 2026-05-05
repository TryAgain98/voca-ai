import { NextResponse } from 'next/server'

import {
  AnthropicProvider,
  GeminiProvider,
  GroqProvider,
  OpenAIProvider,
} from '~/providers/ai'

const providers = [
  new GroqProvider(),
  new GeminiProvider(),
  new OpenAIProvider(),
  new AnthropicProvider(),
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
    for (const provider of providers) {
      try {
        const vocabularies = await provider.extractVocabulary(base64, mimeType)
        return NextResponse.json({ vocabularies, provider: provider.name })
      } catch (err) {
        errors.push(
          `${provider.name}: ${err instanceof Error ? err.message : 'failed'}`,
        )
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
