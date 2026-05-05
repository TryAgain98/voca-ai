import { NextResponse } from 'next/server'

import { GroqProvider } from '~/providers/ai'

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }

  return dp[m][n]
}

function scoreTranscript(transcript: string, expected: string): number {
  const normalize = (s: string): string => s.toLowerCase().trim()
  const a = normalize(transcript)
  const b = normalize(expected)

  if (a === b) return 100

  const distance = levenshtein(a, b)
  const maxLen = Math.max(a.length, b.length)
  return Math.round((1 - distance / maxLen) * 100)
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const formData = await req.formData()
    const audio = formData.get('audio') as File | null
    const expected = formData.get('expected') as string | null

    if (!audio || !expected) {
      return NextResponse.json(
        { error: 'Missing audio or expected' },
        { status: 400 },
      )
    }

    const groq = new GroqProvider()
    const transcript = await groq.transcribeAudio(audio)
    const score = scoreTranscript(transcript, expected)

    return NextResponse.json({ transcript, score })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
