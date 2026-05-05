import { NextResponse } from 'next/server'
import { z } from 'zod'

import { GroqProvider, OpenAIProvider } from '~/providers/ai'

import type { TranslationDirection } from '~/providers/ai'

const bodySchema = z.object({
  text: z.string().min(1).max(200),
  direction: z.enum(['word-to-meaning', 'meaning-to-word']),
})

const providers = [new GroqProvider(), new OpenAIProvider()]

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body: unknown = await req.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { text, direction } = parsed.data

    for (const provider of providers) {
      try {
        const suggestion = await provider.suggestTranslation(
          text,
          direction as TranslationDirection,
        )
        if (suggestion) return NextResponse.json({ suggestion })
      } catch {
        // try next provider
      }
    }

    return NextResponse.json({ error: 'All providers failed' }, { status: 500 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
