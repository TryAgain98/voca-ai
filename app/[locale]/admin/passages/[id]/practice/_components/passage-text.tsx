'use client'

import { Volume2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useTTS } from '~/hooks/use-tts'
import { cn } from '~/lib/utils'

import { WordInfoPopup } from './word-info-popup'

import type { PassageSegment, Vocabulary, WordResult, WordTag } from '~/types'

const POS_COLORS: Record<string, string> = {
  n: 'text-blue-300/80',
  v: 'text-emerald-300/80',
  adj: 'text-amber-300/80',
  adv: 'text-violet-300/80',
  prep: 'text-rose-300/70',
  conj: 'text-teal-300/70',
  pron: 'text-sky-300/70',
  det: 'text-[#d0d6e0]',
  other: 'text-[#8a8f98]',
}

function isPunctuation(word: string): boolean {
  return /^[.,!?;:'"()\-–—…]$/.test(word)
}

interface SegmentBlockProps {
  segment: PassageSegment
  tags: WordTag[]
  vocabMap: Map<string, Vocabulary>
  wordResults: WordResult[] | null
  resultOffset: number
  showTranslation: boolean
  segmentTranslation: string
}

function SegmentBlock({
  segment,
  tags,
  vocabMap,
  wordResults,
  resultOffset,
  showTranslation,
  segmentTranslation,
}: SegmentBlockProps) {
  const tts = useTTS(segment.text)
  let wordIdx = 0

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
          {tags.map((tag, i) => {
            const isWord = !isPunctuation(tag.word) && tag.word.trim() !== ''
            const result =
              isWord && wordResults ? wordResults[resultOffset + wordIdx] : null
            if (isWord) wordIdx++

            const needsSpace = i > 0 && !isPunctuation(tag.word)
            const color = result
              ? result.score >= 85
                ? 'text-emerald-400'
                : result.score >= 65
                  ? 'text-amber-400'
                  : 'text-red-400'
              : (POS_COLORS[tag.pos] ?? 'text-[#d0d6e0]')

            const span = (
              <span
                key={i}
                className={cn(
                  color,
                  isWord && 'cursor-pointer underline-offset-2 hover:underline',
                  result && result.score < 85 && 'font-medium',
                )}
              >
                {needsSpace ? ' ' : ''}
                {tag.word}
              </span>
            )

            if (!isWord) return span

            const vocab = vocabMap.get(tag.word.toLowerCase())
            return (
              <WordInfoPopup
                key={i}
                word={tag.word}
                pos={tag.pos}
                vocab={vocab ?? null}
              >
                {span}
              </WordInfoPopup>
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
  wordTags: WordTag[]
  vocabMap: Map<string, Vocabulary>
  wordResults: WordResult[] | null
  showTranslation: boolean
  segmentTranslations: string[]
}

export function PassageText({
  segments,
  wordTags,
  vocabMap,
  wordResults,
  showTranslation,
  segmentTranslations,
}: PassageTextProps) {
  const [assignedTags] = useState(() =>
    assignTagsToSegments(segments, wordTags),
  )

  const segmentOffsets = useMemo(() => {
    const counts = assignedTags.map(
      (tags) =>
        tags.filter((t) => !isPunctuation(t.word) && t.word.trim()).length,
    )
    return counts.map((_, i) => counts.slice(0, i).reduce((s, c) => s + c, 0))
  }, [assignedTags])

  return (
    <div className="flex flex-col gap-1">
      {segments.map((segment, i) => (
        <SegmentBlock
          key={segment.id}
          segment={segment}
          tags={assignedTags[i] ?? []}
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

function assignTagsToSegments(
  segments: PassageSegment[],
  wordTags: WordTag[],
): WordTag[][] {
  let tagIdx = 0
  return segments.map((seg) => {
    const result: WordTag[] = []
    let reconstructed = ''
    const target = seg.text.trim()

    while (tagIdx < wordTags.length) {
      const tag = wordTags[tagIdx]!
      const sep = reconstructed && !isPunctuation(tag.word) ? ' ' : ''
      reconstructed += sep + tag.word
      result.push(tag)
      tagIdx++

      if (
        reconstructed.replace(/\s+/g, ' ').trim() ===
        target.replace(/\s+/g, ' ').trim()
      ) {
        break
      }
      if (reconstructed.length > target.length + 5) break
    }

    return result
  })
}
