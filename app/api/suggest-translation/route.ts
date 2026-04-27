import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'

const bodySchema = z.object({
  text: z.string().min(1).max(200),
  direction: z.enum(['word-to-meaning', 'meaning-to-word']),
})

function buildPrompt(
  text: string,
  direction: 'word-to-meaning' | 'meaning-to-word',
): string {
  if (direction === 'word-to-meaning') {
    return `You are a bilingual English-Vietnamese dictionary. Given the English word or phrase "${text}", provide the Vietnamese meaning in 1-6 words. Return ONLY the Vietnamese meaning, no explanation, no punctuation at the end.`
  }
  return `You are a bilingual English-Vietnamese dictionary. Given the Vietnamese meaning "${text}", suggest the most fitting English word or short phrase. Return ONLY the English word or phrase, nothing else.`
}

async function suggestWithGroq(prompt: string): Promise<string> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const res = await client.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    max_tokens: 32,
    temperature: 0.2,
    messages: [{ role: 'user', content: prompt }],
  })
  return res.choices[0]?.message?.content?.trim() ?? ''
}

async function suggestWithOpenAI(prompt: string): Promise<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 32,
    temperature: 0.2,
    messages: [{ role: 'user', content: prompt }],
  })
  return res.choices[0]?.message?.content?.trim() ?? ''
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body: unknown = await req.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { text, direction } = parsed.data
    const prompt = buildPrompt(text, direction)

    const providers = [
      { name: 'Groq', fn: () => suggestWithGroq(prompt) },
      { name: 'OpenAI', fn: () => suggestWithOpenAI(prompt) },
    ]

    for (const { fn } of providers) {
      try {
        const suggestion = await fn()
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
