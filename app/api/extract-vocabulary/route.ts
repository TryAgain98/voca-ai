import { NextResponse } from 'next/server'

import {
  AnthropicProvider,
  GeminiProvider,
  GroqProvider,
  OpenAIProvider,
} from '~/providers/ai'

import type { ExtractedVocabulary } from '~/providers/ai'

const providers = [
  new GroqProvider(),
  new GeminiProvider(),
  new OpenAIProvider(),
  new AnthropicProvider(),
]

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const formData = await req.formData()
    const images = [
      ...formData.getAll('images'),
      ...formData.getAll('image'),
    ].filter(
      (entry): entry is File =>
        entry instanceof File && entry.type.startsWith('image/'),
    )

    if (images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 })
    }

    const providerNames = new Set<string>()
    const vocabularies: ExtractedVocabulary[] = []

    for (const image of images) {
      const bytes = await image.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      const mimeType = image.type
      const errors: string[] = []

      for (const provider of providers) {
        try {
          const items = await provider.extractVocabulary(base64, mimeType)
          vocabularies.push(...items)
          providerNames.add(provider.name)
          errors.length = 0
          break
        } catch (err) {
          errors.push(
            `${provider.name}: ${err instanceof Error ? err.message : 'failed'}`,
          )
        }
      }

      if (errors.length > 0) {
        return NextResponse.json(
          {
            error: `All providers failed for ${image.name || 'image'}:\n${errors.join('\n')}`,
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({
      vocabularies,
      provider: Array.from(providerNames).join(', '),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
