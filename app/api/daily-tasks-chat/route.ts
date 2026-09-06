import { NextResponse } from 'next/server'

import { AnthropicProvider, GeminiProvider, GroqProvider } from '~/providers/ai'

const providers = [
  new GroqProvider(),
  new GeminiProvider(),
  new AnthropicProvider(),
]

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { message } = (await req.json()) as { message: string }

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'message is required' },
        { status: 400 },
      )
    }

    const errors: string[] = []
    for (const provider of providers) {
      try {
        const items = await provider.parseDailyTasksChat(message)
        return NextResponse.json({ items })
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
