'use client'

import { Volume2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { useTTS } from '~/hooks/use-tts'
import { segmentsFromContent } from '~/lib/passage-segments'
import { cn } from '~/lib/utils'

import { PassageLookupContext } from '../_utils/passage-lookup-context'

import { WordInfoPopup } from './word-info-popup'

import type { PassageLookupState } from '../_utils/passage-lookup-context'
import type { WordLookup } from '~/providers/ai'
import type { PassageSegment, WordResult } from '~/types'

interface SegmentToken {
  text: string
  isWord: boolean
  wordIdx: number
  key: string
}

function tokenizeSegment(text: string): SegmentToken[] {
  const tokens: SegmentToken[] = []
  let pos = 0
  let wordIdx = 0

  while (pos < text.length) {
    // Non-word character (space, punctuation, standalone hyphen)
    if (!/[\w']/.test(text[pos])) {
      let end = pos + 1
      while (end < text.length && !/[\w']/.test(text[end])) end++
      tokens.push({
        text: text.slice(pos, end),
        isWord: false,
        wordIdx: -1,
        key: `g${pos}`,
      })
      pos = end
      continue
    }

    // Word: consume letters/digits/apostrophes, bridging hyphens only when
    // the hyphen is immediately followed by another word character.
    // "state-of-the-art" → one token; "Hello - World" → hyphen stays in gap.
    let end = pos
    while (end < text.length) {
      if (/[\w']/.test(text[end])) {
        end++
      } else if (
        text[end] === '-' &&
        end + 1 < text.length &&
        /[\w']/.test(text[end + 1])
      ) {
        end++
      } else {
        break
      }
    }

    const wordText = text.slice(pos, end)
    // Advance wordIdx by the number of hyphen-separated components so that
    // speech-score indices (which count "state","of","the","art" as 4 words)
    // stay aligned with our compound token.
    const componentCount = wordText.split('-').length

    tokens.push({ text: wordText, isWord: true, wordIdx, key: `w${pos}` })
    wordIdx += componentCount
    pos = end
  }

  return tokens
}

const passageCache = new Map<string, Map<string, WordLookup>>()
const passageInFlight = new Map<string, Promise<void>>()

interface SegmentBlockProps {
  segment: PassageSegment
  wordResults: WordResult[] | null
  resultOffset: number
}

function SegmentBlock({
  segment,
  wordResults,
  resultOffset,
}: SegmentBlockProps) {
  const tts = useTTS(segment.text)
  const tokens = useMemo(() => tokenizeSegment(segment.text), [segment.text])

  return (
    <>
      <button
        onClick={tts.speak}
        className={cn(
          'mr-1 inline-block rounded p-0.5 align-middle transition-colors',
          tts.isSpeaking
            ? 'text-[#7170ff]'
            : 'text-[#8a8f98] hover:text-[#d0d6e0]',
        )}
      >
        <Volume2 size={12} />
      </button>
      {tokens.map((tok) => {
        if (!tok.isWord) {
          return (
            <span key={tok.key} className="text-foreground">
              {tok.text}
            </span>
          )
        }

        const wr = wordResults?.[resultOffset + tok.wordIdx] ?? null
        const color = wr
          ? wr.score >= 85
            ? 'text-emerald-400'
            : wr.score >= 65
              ? 'text-amber-400'
              : 'text-red-400'
          : 'text-foreground'

        return (
          <WordInfoPopup key={tok.key} word={tok.text}>
            <span
              className={cn(
                color,
                'cursor-pointer underline-offset-2 hover:underline',
                wr && wr.score < 85 && 'font-medium',
              )}
            >
              {tok.text}
            </span>
          </WordInfoPopup>
        )
      })}{' '}
    </>
  )
}

interface PassageTextProps {
  content: string
  passageId: string
  wordResults: WordResult[] | null
}

export function PassageText({
  content,
  passageId,
  wordResults,
}: PassageTextProps) {
  const segments = useMemo(() => segmentsFromContent(content), [content])

  // Keep using the old word-per-token regex for segment offsets so that
  // speech-score indices (one per spoken word) stay correctly aligned.
  const segmentOffsets = useMemo(() => {
    const counts = segments.map(
      (seg) => (seg.text.match(/\b[\w']+\b/g) ?? []).length,
    )
    return counts.map((_, i) => counts.slice(0, i).reduce((s, c) => s + c, 0))
  }, [segments])

  const [lookupState, setLookupState] = useState<PassageLookupState>(() => {
    const cached = passageCache.get(passageId)
    return { wordMap: cached ?? new Map(), isLoading: !cached }
  })

  useEffect(() => {
    if (passageCache.has(passageId)) return

    const doFetch = async (): Promise<void> => {
      try {
        const res = await fetch('/api/word-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passageText: content }),
        })
        if (!res.ok) throw new Error(`word-lookup ${res.status}`)
        const data = (await res.json()) as Record<string, WordLookup>
        const map = new Map(
          Object.entries(data).map(([k, v]) => [k.toLowerCase(), v]),
        )
        passageCache.set(passageId, map)
        setLookupState({ wordMap: map, isLoading: false })
      } catch {
        const empty = new Map<string, WordLookup>()
        passageCache.set(passageId, empty)
        setLookupState({ wordMap: empty, isLoading: false })
      } finally {
        passageInFlight.delete(passageId)
      }
    }

    const existing = passageInFlight.get(passageId)
    if (existing) {
      void existing.then(() => {
        const cached =
          passageCache.get(passageId) ?? new Map<string, WordLookup>()
        setLookupState({ wordMap: cached, isLoading: false })
      })
      return
    }

    const promise = doFetch()
    passageInFlight.set(passageId, promise)
  }, [passageId, content])

  return (
    <PassageLookupContext.Provider value={lookupState}>
      <p className="text-base leading-relaxed">
        {segments.map((segment, i) => (
          <SegmentBlock
            key={segment.id}
            segment={segment}
            wordResults={wordResults}
            resultOffset={segmentOffsets[i] ?? 0}
          />
        ))}
      </p>
    </PassageLookupContext.Provider>
  )
}
