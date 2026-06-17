import { NextResponse } from 'next/server'

import { AnthropicProvider, GroqProvider } from '~/providers/ai'

const providers = [new GroqProvider(), new AnthropicProvider()]

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { imageUrl, keywords, userSentence } = (await req.json()) as {
      imageUrl: string
      keywords: string[]
      userSentence: string
    }

    if (!imageUrl || !keywords?.length || !userSentence?.trim()) {
      return NextResponse.json(
        { error: 'imageUrl, keywords, and userSentence are required' },
        { status: 400 },
      )
    }

    const errors: string[] = []
    for (const provider of providers) {
      try {
        const result = await provider.scoreWriting(
          imageUrl,
          keywords,
          userSentence,
        )
        return NextResponse.json(result)
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
