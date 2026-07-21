import Anthropic from '@anthropic-ai/sdk'
import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

import type { GrammarError } from '~/providers/ai/types'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatContext {
  keywords: string[]
  userSentence: string
  grammarScore: number
  grammarFeedback: string
  grammarErrors: GrammarError[]
  relevanceScore: number
  relevanceFeedback: string
  improvedSentence: string
  idealSentence: string
}

interface ChatRequest {
  context: ChatContext
  messages: ChatMessage[]
}

function buildSystemPrompt(ctx: ChatContext): string {
  const errorsText =
    ctx.grammarErrors.length > 0
      ? ctx.grammarErrors
          .map((e) => `  - "${e.wrong}" → "${e.fix}": ${e.reason.en}`)
          .join('\n')
      : '  None'

  return `You are a concise English writing tutor helping a Vietnamese learner (A2-B1 level) understand their writing exercise result.

## Exercise Context
- Keywords: [${ctx.keywords.join(', ')}]
- Student's sentence: "${ctx.userSentence}"

## Scoring Result
- Grammar ${ctx.grammarScore}/100: ${ctx.grammarFeedback}
- Grammar errors:
${errorsText}
- Relevance ${ctx.relevanceScore}/100: ${ctx.relevanceFeedback}
- Improved: "${ctx.improvedSentence}"
- Ideal: "${ctx.idealSentence}"

## Response Rules
1. **Always use Markdown** — bold key terms, bullet lists for multiple points, backtick for sentence examples.
2. **Be short and structured** — max 3-5 lines. No long paragraphs.
3. **Format errors as**: ❌ \`wrong\` → ✅ \`fix\` — *reason*
4. **End with one short tip or example** when helpful.
5. **Respond in the same language** the student uses (Vietnamese or English).`
}

async function streamWithGroq(
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<ReadableStream<Uint8Array>> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const stream = await client.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    max_tokens: 1024,
    stream: true,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
  })

  const encoder = new TextEncoder()
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
  const writer = writable.getWriter()

  void (async () => {
    try {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content
        if (text) await writer.write(encoder.encode(text))
      }
    } finally {
      await writer.close()
    }
  })()

  return readable
}

async function streamWithAnthropic(
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<ReadableStream<Uint8Array>> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const stream = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    stream: true,
    system: systemPrompt,
    messages,
  })

  const encoder = new TextEncoder()
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
  const writer = writable.getWriter()

  void (async () => {
    try {
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          await writer.write(encoder.encode(event.delta.text))
        }
      }
    } finally {
      await writer.close()
    }
  })()

  return readable
}

export async function POST(req: Request): Promise<NextResponse | Response> {
  try {
    const { context, messages } = (await req.json()) as ChatRequest

    if (!context || !messages?.length) {
      return NextResponse.json(
        { error: 'context and messages are required' },
        { status: 400 },
      )
    }

    const systemPrompt = buildSystemPrompt(context)
    const errors: string[] = []

    for (const [name, fn] of [
      ['Groq', () => streamWithGroq(systemPrompt, messages)],
      ['Anthropic', () => streamWithAnthropic(systemPrompt, messages)],
    ] as [string, () => Promise<ReadableStream<Uint8Array>>][]) {
      try {
        const readable = await fn()
        return new Response(readable, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      } catch (err) {
        errors.push(`${name}: ${err instanceof Error ? err.message : 'failed'}`)
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
