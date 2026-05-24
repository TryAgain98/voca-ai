import { NextResponse } from 'next/server'

import { vocabulariesService } from '~/services/vocabularies.service'

export interface WordDetailBatch {
  meaning: string
  ipa: string | null
  wordType: string | null
  example: string | null
  synonyms: string[]
  description: string | null
}

export type WordDetailsBatchResponse = Record<string, WordDetailBatch>

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { words } = (await req.json()) as { words: string[] }

    if (!Array.isArray(words) || words.length === 0) {
      return NextResponse.json({})
    }

    const vocabs = await vocabulariesService.findByWordsInsensitive(words)

    const result: WordDetailsBatchResponse = {}
    for (const vocab of vocabs) {
      result[vocab.word.toLowerCase()] = {
        meaning: vocab.meaning,
        ipa: vocab.phonetic,
        wordType: vocab.word_type,
        example: vocab.example,
        synonyms: vocab.synonyms ?? [],
        description: vocab.description,
      }
    }

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
