import { NextResponse } from 'next/server'

import { synonymSyncService } from '~/services/synonym-sync.service'

import type { Vocabulary } from '~/types'

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = (await req.json()) as
      | { vocab: Vocabulary }
      | { vocabs: Vocabulary[] }
      | { vocabId: string }

    console.log('[sync-synonyms] body keys:', Object.keys(body))

    if ('vocabId' in body) {
      console.log('[sync-synonyms] cleanAndSync for', body.vocabId)
      await synonymSyncService.cleanAndSyncForVocabId(body.vocabId)
    } else if ('vocabs' in body) {
      console.log('[sync-synonyms] syncForVocabs count:', body.vocabs.length)
      await synonymSyncService.syncForVocabs(body.vocabs)
    } else {
      console.log(
        '[sync-synonyms] syncForVocab:',
        body.vocab.word,
        '|',
        body.vocab.meaning,
      )
      await synonymSyncService.syncForVocab(body.vocab)
    }

    console.log('[sync-synonyms] done')
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
