import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

import { buildStoryPassagePrompt } from '~/providers/ai/utils'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { genre, words } = (await req.json()) as {
      genre: string
      words: { word: string; meaning: string }[]
    }

    if (!genre || !words?.length) {
      return NextResponse.json(
        { error: 'genre and words are required' },
        { status: 400 },
      )
    }

    const res = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      max_tokens: 1024,
      temperature: 0.8,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'user', content: buildStoryPassagePrompt(genre, words) },
      ],
    })

    const raw = res.choices[0]?.message?.content?.trim() ?? '{}'
    const parsed = JSON.parse(raw) as { passage?: string; translation?: string }

    return NextResponse.json({
      passage: parsed.passage ?? '',
      translation: parsed.translation ?? '',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
