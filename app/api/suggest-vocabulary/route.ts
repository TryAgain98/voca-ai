import { NextResponse } from 'next/server'
import { z } from 'zod'

import { GroqProvider } from '~/providers/ai'

const bodySchema = z.object({
  word: z.string().min(1).max(100),
})

const provider = new GroqProvider()

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body: unknown = await req.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const fill = await provider.suggestVocabularyFill(parsed.data.word)
    return NextResponse.json(fill)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
