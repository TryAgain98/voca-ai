'use client'

import { Volume2 } from 'lucide-react'
import { useMemo } from 'react'

import { useTTS } from '~/hooks/use-tts'
import { segmentsFromContent } from '~/lib/passage-segments'
import { cn } from '~/lib/utils'

import { WordInfoPopup } from './word-info-popup'

import type { PassageSegment, Vocabulary, WordResult } from '~/types'

interface SegmentToken {
  text: string
  isWord: boolean
  wordIdx: number
  key: string
}

function tokenizeSegment(text: string): SegmentToken[] {
  const tokens: SegmentToken[] = []
  const regex = /\b[\w']+\b/g
  let lastIdx = 0
  let wordIdx = 0
  let m: RegExpExecArray | null

  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      tokens.push({
        text: text.slice(lastIdx, m.index),
        isWord: false,
        wordIdx: -1,
        key: `g${lastIdx}`,
      })
    }
    tokens.push({
      text: m[0],
      isWord: true,
      wordIdx: wordIdx++,
      key: `w${m.index}`,
    })
    lastIdx = m.index + m[0].length
  }

  if (lastIdx < text.length) {
    tokens.push({
      text: text.slice(lastIdx),
      isWord: false,
      wordIdx: -1,
      key: `g${lastIdx}`,
    })
  }

  return tokens
}

interface SegmentBlockProps {
  segment: PassageSegment
  vocabMap: Map<string, Vocabulary>
  wordResults: WordResult[] | null
  resultOffset: number
}

function SegmentBlock({
  segment,
  vocabMap,
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
          <WordInfoPopup
            key={tok.key}
            word={tok.text}
            vocab={vocabMap.get(tok.text.toLowerCase()) ?? null}
          >
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
  vocabMap: Map<string, Vocabulary>
  wordResults: WordResult[] | null
}

export function PassageText({
  content,
  vocabMap,
  wordResults,
}: PassageTextProps) {
  const segments = useMemo(() => segmentsFromContent(content), [content])

  const segmentOffsets = useMemo(() => {
    const counts = segments.map(
      (seg) => (seg.text.match(/\b[\w']+\b/g) ?? []).length,
    )
    return counts.map((_, i) => counts.slice(0, i).reduce((s, c) => s + c, 0))
  }, [segments])

  return (
    <p className="text-base leading-relaxed">
      {segments.map((segment, i) => (
        <SegmentBlock
          key={segment.id}
          segment={segment}
          vocabMap={vocabMap}
          wordResults={wordResults}
          resultOffset={segmentOffsets[i] ?? 0}
        />
      ))}
    </p>
  )
}
