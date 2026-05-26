import { Readable } from 'stream'

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import type { NextRequest } from 'next/server'

const querySchema = z.object({
  text: z.string().min(1).max(4096),
  voice: z
    .enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'])
    .default('nova'),
  speed: z.coerce.number().min(0.25).max(4.0).default(1.0),
})

const VOICE_MAP: Record<string, string> = {
  nova: 'en-US-AriaNeural',
  alloy: 'en-US-JennyNeural',
  echo: 'en-US-GuyNeural',
  fable: 'en-US-BrianNeural',
  onyx: 'en-US-ChristopherNeural',
  shimmer: 'en-US-EmmaNeural',
}

const CACHE_CONTROL = 'public, max-age=604800, stale-while-revalidate=86400'

function collectStream(readable: Readable): Promise<Uint8Array<ArrayBuffer>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    readable.on('data', (chunk: Buffer) => chunks.push(chunk))
    readable.on('error', reject)
    readable.on('end', () => {
      const merged = Buffer.concat(chunks)
      const result = new Uint8Array(merged.byteLength)
      result.set(merged)
      resolve(result as Uint8Array<ArrayBuffer>)
    })
  })
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = req.nextUrl
    const parsed = querySchema.safeParse({
      text: searchParams.get('text'),
      voice: searchParams.get('voice'),
      speed: searchParams.get('speed'),
    })
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { text, voice, speed } = parsed.data
    const edgeVoice = VOICE_MAP[voice] ?? 'en-US-AriaNeural'

    const tts = new MsEdgeTTS()
    await tts.setMetadata(
      edgeVoice,
      OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3,
    )
    const { audioStream } = tts.toStream(text, { rate: speed })
    const audio = await collectStream(audioStream)
    tts.close()

    return new NextResponse(audio.buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audio.byteLength),
        'Cache-Control': CACHE_CONTROL,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
