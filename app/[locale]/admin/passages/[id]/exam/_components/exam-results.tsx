'use client'

import { Volume2 } from 'lucide-react'
import { useMemo } from 'react'

import { useTTS } from '~/hooks/use-tts'
import { scoreBg, scoreColor, scoreLevel } from '~/lib/passage-score'
import { cn } from '~/lib/utils'

import type { PassageSegment, WordResult, WordTag } from '~/types'

function isPunctuation(word: string): boolean {
  return /^[.,!?;:'"()\-–—…]$/.test(word)
}

const VERDICT: Record<string, { title: string; hint: string }> = {
  good: { title: '🏆 Xuất sắc!', hint: 'Phát âm và tốc độ rất tốt!' },
  ok: { title: '👍 Khá tốt!', hint: 'Một số từ cần cải thiện — thử lại nhé.' },
  poor: {
    title: '💪 Cần luyện thêm!',
    hint: 'Hãy dùng chế độ luyện tập trước khi thi lại.',
  },
}

interface SegmentResultProps {
  segment: PassageSegment
  tags: WordTag[]
  wordResults: WordResult[]
  resultOffset: number
}

function SegmentResult({
  segment,
  tags,
  wordResults,
  resultOffset,
}: SegmentResultProps) {
  const tts = useTTS(segment.text)
  let wordIdx = 0

  const segmentScore =
    tags.filter((t) => !isPunctuation(t.word) && t.word.trim()).length > 0
      ? Math.round(
          tags
            .filter((t) => !isPunctuation(t.word) && t.word.trim())
            .reduce((acc, _, i) => {
              const r = wordResults[resultOffset + i]
              return acc + (r?.score ?? 100)
            }, 0) /
            tags.filter((t) => !isPunctuation(t.word) && t.word.trim()).length,
        )
      : 100

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3',
        segmentScore < 65
          ? 'border-red-400/20 bg-red-400/5'
          : segmentScore < 85
            ? 'border-amber-400/20 bg-amber-400/5'
            : 'border-white/5 bg-white/1',
      )}
    >
      <button
        onClick={tts.speak}
        className={cn(
          'mt-0.5 shrink-0 rounded-md p-1 transition-colors',
          tts.isSpeaking
            ? 'text-[#7170ff]'
            : 'text-[#8a8f98] hover:text-[#d0d6e0]',
        )}
      >
        <Volume2 size={14} />
      </button>

      <div className="flex-1">
        <p className="text-base leading-relaxed">
          {tags.map((tag, i) => {
            const isWord = !isPunctuation(tag.word) && tag.word.trim() !== ''
            const result = isWord ? wordResults[resultOffset + wordIdx] : null
            if (isWord) wordIdx++
            const needsSpace = i > 0 && !isPunctuation(tag.word)

            if (!result) {
              return (
                <span key={i} className="text-[#8a8f98]">
                  {needsSpace ? ' ' : ''}
                  {tag.word}
                </span>
              )
            }

            return (
              <span
                key={i}
                title={result.got ? `Bạn nói: "${result.got}"` : 'Bỏ qua'}
                className={cn(
                  'cursor-help rounded px-0.5 transition-colors',
                  scoreColor(result.score),
                  scoreBg(result.score),
                )}
              >
                {needsSpace ? ' ' : ''}
                {tag.word}
              </span>
            )
          })}
        </p>

        {segmentScore < 85 && (
          <div className="mt-2 text-xs text-[#8a8f98]">
            {tags
              .filter((t) => !isPunctuation(t.word) && t.word.trim())
              .map((_t, i) => {
                const r = wordResults[resultOffset + i]
                if (!r || r.score >= 85) return null
                return (
                  <span key={i} className="mr-2">
                    <span className={scoreColor(r.score)}>{r.word}</span>
                    {r.got && r.got !== r.word && (
                      <span className="text-[#8a8f98]">
                        {' '}
                        → &ldquo;{r.got}&rdquo;
                      </span>
                    )}
                  </span>
                )
              })}
          </div>
        )}
      </div>

      <span
        className={cn(
          'shrink-0 text-sm font-semibold',
          scoreColor(segmentScore),
        )}
      >
        {segmentScore}
      </span>
    </div>
  )
}

interface ExamResultsProps {
  segments: PassageSegment[]
  wordTags: WordTag[]
  wordResults: WordResult[]
  score: number
  elapsed: number
  benchmarkTime: number | null
}

export function ExamResults({
  segments,
  wordTags,
  wordResults,
  score,
  elapsed,
  benchmarkTime,
}: ExamResultsProps) {
  const level = scoreLevel(score)
  const verdict = VERDICT[level]!
  const fluency =
    benchmarkTime && elapsed > 0
      ? Math.max(0, Math.min(100, Math.round((benchmarkTime / elapsed) * 100)))
      : null

  const assignedTags = useMemo(
    () => assignTagsToSegments(segments, wordTags),
    [segments, wordTags],
  )

  const segmentOffsets = useMemo(() => {
    const counts = assignedTags.map(
      (tags) =>
        tags.filter((t) => !isPunctuation(t.word) && t.word.trim()).length,
    )
    return counts.map((_, i) => counts.slice(0, i).reduce((s, c) => s + c, 0))
  }, [assignedTags])

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex items-center gap-6 rounded-xl border p-5"
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <span className={cn('text-5xl font-bold', scoreColor(score))}>
            {score}
          </span>
          <span className="text-xs text-[#8a8f98]">phát âm</span>
        </div>
        {fluency !== null && (
          <div className="flex flex-col items-center gap-1">
            <span className={cn('text-5xl font-bold', scoreColor(fluency))}>
              {fluency}
            </span>
            <span className="text-xs text-[#8a8f98]">tốc độ</span>
          </div>
        )}
        <div>
          <p className="text-base font-medium text-[#f7f8f8]">
            {verdict.title}
          </p>
          <p className="mt-0.5 text-sm text-[#8a8f98]">{verdict.hint}</p>
          <p className="mt-1 text-xs text-[#8a8f98]">
            Thời gian: {elapsed}s
            {benchmarkTime ? ` / mốc: ${benchmarkTime}s` : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {segments.map((segment, i) => (
          <SegmentResult
            key={segment.id}
            segment={segment}
            tags={assignedTags[i] ?? []}
            wordResults={wordResults}
            resultOffset={segmentOffsets[i] ?? 0}
          />
        ))}
      </div>
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
      )
        break
      if (reconstructed.length > target.length + 5) break
    }

    return result
  })
}
