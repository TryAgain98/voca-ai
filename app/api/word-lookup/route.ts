import { NextResponse } from 'next/server'

import { GroqProvider } from '~/providers/ai'

import type { PassageWordMap } from '~/providers/ai'

const providers = [new GroqProvider()]

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { passageText } = (await req.json()) as { passageText: string }

    if (!passageText?.trim()) {
      return NextResponse.json(
        { error: 'passageText is required' },
        { status: 400 },
      )
    }

    const errors: string[] = []

    for (const provider of providers) {
      try {
        const result = await provider.lookupPassageWords(passageText)
        return NextResponse.json(result satisfies PassageWordMap)
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
