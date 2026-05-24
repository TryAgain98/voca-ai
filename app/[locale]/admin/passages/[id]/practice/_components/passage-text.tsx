'use client'

import { Volume2 } from 'lucide-react'
import { useMemo } from 'react'

import { useTTS } from '~/hooks/use-tts'
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
  showTranslation: boolean
  segmentTranslation: string
}

function SegmentBlock({
  segment,
  vocabMap,
  wordResults,
  resultOffset,
  showTranslation,
  segmentTranslation,
}: SegmentBlockProps) {
  const tts = useTTS(segment.text)
  const tokens = useMemo(() => tokenizeSegment(segment.text), [segment.text])

  return (
    <div className="group relative flex items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/2">
      <button
        onClick={tts.speak}
        className={cn(
          'mt-0.5 shrink-0 rounded-md p-1 transition-colors',
          tts.isSpeaking
            ? 'bg-[#5e6ad2]/15 text-[#7170ff]'
            : 'text-[#8a8f98] hover:bg-white/5 hover:text-[#d0d6e0]',
        )}
      >
        <Volume2 size={14} />
      </button>

      <div className="flex-1">
        <p className="text-base leading-relaxed">
          {tokens.map((tok) => {
            if (!tok.isWord) {
              return (
                <span key={tok.key} className="text-[#d0d6e0]">
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
              : 'text-[#d0d6e0]'

            const wordSpan = (
              <span
                key={tok.key}
                className={cn(
                  color,
                  'cursor-pointer underline-offset-2 hover:underline',
                  wr && wr.score < 85 && 'font-medium',
                )}
              >
                {tok.text}
              </span>
            )

            const vocab = vocabMap.get(tok.text.toLowerCase())
            return vocab ? (
              <WordInfoPopup key={tok.key} word={tok.text} vocab={vocab}>
                {wordSpan}
              </WordInfoPopup>
            ) : (
              wordSpan
            )
          })}
        </p>
        {showTranslation && segmentTranslation && (
          <p className="mt-1 text-sm text-[#8a8f98] italic">
            {segmentTranslation}
          </p>
        )}
      </div>
    </div>
  )
}

interface PassageTextProps {
  segments: PassageSegment[]
  vocabMap: Map<string, Vocabulary>
  wordResults: WordResult[] | null
  showTranslation: boolean
  segmentTranslations: string[]
}

export function PassageText({
  segments,
  vocabMap,
  wordResults,
  showTranslation,
  segmentTranslations,
}: PassageTextProps) {
  const segmentOffsets = useMemo(() => {
    const counts = segments.map(
      (seg) => (seg.text.match(/\b[\w']+\b/g) ?? []).length,
    )
    return counts.map((_, i) => counts.slice(0, i).reduce((s, c) => s + c, 0))
  }, [segments])

  return (
    <div className="flex flex-col gap-1">
      {segments.map((segment, i) => (
        <SegmentBlock
          key={segment.id}
          segment={segment}
          vocabMap={vocabMap}
          wordResults={wordResults}
          resultOffset={segmentOffsets[i] ?? 0}
          showTranslation={showTranslation}
          segmentTranslation={segmentTranslations[i] ?? ''}
        />
      ))}
    </div>
  )
}
