import { NextResponse } from 'next/server'

import { GroqProvider } from '~/providers/ai'
import { vocabulariesService } from '~/services/vocabularies.service'

const groq = new GroqProvider()

interface DictPhonetic {
  text?: string
}

interface DictDefinition {
  definition: string
  example?: string
}

interface DictMeaning {
  partOfSpeech: string
  definitions: DictDefinition[]
}

interface DictEntry {
  phonetic?: string
  phonetics: DictPhonetic[]
  meanings: DictMeaning[]
}

export interface WordDetailResponse {
  source: 'db' | 'dictionary' | null
  meaning: string | null
  ipa: string | null
  wordType: string | null
  example: string | null
  synonyms: string[]
  description: string | null
}

const EMPTY_RESPONSE: WordDetailResponse = {
  source: null,
  meaning: null,
  ipa: null,
  wordType: null,
  example: null,
  synonyms: [],
  description: null,
}

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)
  const word = searchParams.get('word')?.trim()

  if (!word) {
    return NextResponse.json({ error: 'word is required' }, { status: 400 })
  }

  const vocab = await vocabulariesService.findByWord(word)
  if (vocab) {
    return NextResponse.json({
      source: 'db',
      meaning: vocab.meaning,
      ipa: vocab.phonetic,
      wordType: vocab.word_type,
      example: vocab.example,
      synonyms: vocab.synonyms,
      description: vocab.description,
    } satisfies WordDetailResponse)
  }

  const [dictResult, meaningResult] = await Promise.allSettled([
    fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`,
    ).then((r) => (r.ok ? (r.json() as Promise<DictEntry[]>) : null)),
    groq.suggestTranslation(word, 'word-to-meaning'),
  ])

  const dictEntry =
    dictResult.status === 'fulfilled' ? (dictResult.value?.[0] ?? null) : null
  const meaning =
    meaningResult.status === 'fulfilled' ? (meaningResult.value ?? null) : null

  if (dictEntry ?? meaning) {
    const ipa =
      dictEntry?.phonetics.find((p) => p.text)?.text ??
      dictEntry?.phonetic ??
      null
    const firstMeaning = dictEntry?.meanings[0]
    return NextResponse.json({
      source: 'dictionary',
      meaning,
      ipa,
      wordType: firstMeaning?.partOfSpeech ?? null,
      example: firstDef?.example ?? null,
      synonyms: [],
      description: null,
    } satisfies WordDetailResponse)
  }

  return NextResponse.json(EMPTY_RESPONSE satisfies WordDetailResponse)
}
