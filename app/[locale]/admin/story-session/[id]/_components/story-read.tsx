'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Button } from '~/components/ui/button'
import { PassageLookupContext } from '~/lib/word-lookup-context'

import { SentenceBlock } from './sentence-block'

import type { WordDetailsBatchResponse } from '~/app/api/word-details-batch/route'
import type {
  PassageLookupState,
  PassageWordDetail,
} from '~/lib/word-lookup-context'
import type { WordLookup } from '~/providers/ai'
import type { StoryWord } from '~/types'

const storyCache = new Map<string, Map<string, PassageWordDetail>>()
const storyInFlight = new Map<string, Promise<void>>()

interface StoryReadProps {
  sessionId: string
  passageText: string
  translation: string
  targetWords: StoryWord[]
  onComplete: () => void
  isLoading: boolean
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function highlightMeaning(
  text: string,
  meaning: string | null,
): React.ReactNode {
  if (!meaning) return text
  const idx = text.toLowerCase().indexOf(meaning.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-primary rounded-sm px-0.5 not-italic">
        {text.slice(idx, idx + meaning.length)}
      </mark>
      {text.slice(idx + meaning.length)}
    </>
  )
}

export function StoryRead({
  sessionId,
  passageText,
  translation,
  targetWords,
  onComplete,
  isLoading,
}: StoryReadProps) {
  const t = useTranslations('Story')
  const [showTranslation, setShowTranslation] = useState(false)
  const [hoveredMeaning, setHoveredMeaning] = useState<string | null>(null)
  const [lookupState, setLookupState] = useState<PassageLookupState>(() => {
    const cached = storyCache.get(sessionId)
    return { detailMap: cached ?? new Map(), isLoading: !cached }
  })

  const enSentences = splitSentences(passageText)
  const viSentences = splitSentences(translation)

  useEffect(() => {
    if (storyCache.has(sessionId)) return

    const doFetch = async (): Promise<void> => {
      try {
        const res = await fetch('/api/word-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passageText }),
        })
        if (!res.ok) throw new Error(`word-lookup ${res.status}`)
        const aiData = (await res.json()) as Record<string, WordLookup>

        const words = Object.keys(aiData)
        let dbData: WordDetailsBatchResponse = {}
        try {
          const dbRes = await fetch('/api/word-details-batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ words }),
          })
          if (dbRes.ok)
            dbData = (await dbRes.json()) as WordDetailsBatchResponse
        } catch {
          // non-fatal: fall back to AI data only
        }

        const detailMap = new Map<string, PassageWordDetail>()
        for (const [word, ai] of Object.entries(aiData)) {
          const key = word.toLowerCase()
          const db = dbData[key]
          detailMap.set(key, {
            meaning: db?.meaning ?? ai.meaning,
            ipa: db?.ipa ?? ai.ipa,
            wordType: db?.wordType ?? null,
            example: db?.example ?? null,
            synonyms: db?.synonyms ?? [],
            description: db?.description ?? null,
            source: db ? 'db' : 'ai',
          })
        }

        storyCache.set(sessionId, detailMap)
        setLookupState({ detailMap, isLoading: false })
      } catch {
        storyCache.set(sessionId, new Map())
        setLookupState({ detailMap: new Map(), isLoading: false })
      } finally {
        storyInFlight.delete(sessionId)
      }
    }

    const existing = storyInFlight.get(sessionId)
    if (existing) {
      void existing.then(() => {
        const cached =
          storyCache.get(sessionId) ?? new Map<string, PassageWordDetail>()
        setLookupState({ detailMap: cached, isLoading: false })
      })
      return
    }

    const promise = doFetch()
    storyInFlight.set(sessionId, promise)
  }, [sessionId, passageText])

  return (
    <PassageLookupContext.Provider value={lookupState}>
      <div className="flex flex-col gap-6">
        <div className="bg-card rounded-2xl border px-6 py-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-[510] tracking-wider uppercase">
              {t('readInstruction')}
            </p>
            <button
              onClick={() => setShowTranslation((v) => !v)}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
            >
              {showTranslation ? <EyeOff size={12} /> : <Eye size={12} />}
              {showTranslation
                ? t('readHideTranslation')
                : t('readShowTranslation')}
            </button>
          </div>

          <p className="text-foreground leading-loose">
            {enSentences.map((sentence, i) => (
              <SentenceBlock
                key={i}
                sentence={sentence}
                targetWords={targetWords}
                onWordEnter={setHoveredMeaning}
                onWordLeave={() => setHoveredMeaning(null)}
              />
            ))}
          </p>

          {showTranslation && (
            <div className="border-border mt-4 space-y-1 border-t pt-4">
              {viSentences.map((vi, i) => (
                <p
                  key={i}
                  className="text-muted-foreground text-sm leading-relaxed italic"
                >
                  {highlightMeaning(vi, hoveredMeaning)}
                </p>
              ))}
            </div>
          )}

          <p className="text-muted-foreground mt-4 text-xs">
            {t('readHoverHint')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {targetWords.map((w) => (
            <div key={w.id} className="bg-muted rounded-lg px-3 py-1.5 text-xs">
              <span className="font-[590]">{w.word}</span>
              <span className="text-muted-foreground"> — {w.meaning}</span>
            </div>
          ))}
        </div>

        <Button onClick={onComplete} disabled={isLoading} className="w-full">
          {t('readDoneBtn')}
        </Button>
      </div>
    </PassageLookupContext.Provider>
  )
}
