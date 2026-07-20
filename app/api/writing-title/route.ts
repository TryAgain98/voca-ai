import { NextResponse } from 'next/server'

import { AnthropicProvider, GeminiProvider, GroqProvider } from '~/providers/ai'

const providers = [
  new GroqProvider(),
  new GeminiProvider(),
  new AnthropicProvider(),
]

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { imageUrl, keywords } = (await req.json()) as {
      imageUrl: string
      keywords: string[]
    }

    if (!imageUrl || !keywords?.length) {
      return NextResponse.json(
        { error: 'imageUrl and keywords are required' },
        { status: 400 },
      )
    }

    const errors: string[] = []
    for (const provider of providers) {
      try {
        const title = await provider.generateWritingTitle(imageUrl, keywords)
        return NextResponse.json({ title })
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
