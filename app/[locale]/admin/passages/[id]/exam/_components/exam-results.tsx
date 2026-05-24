'use client'

import { Volume2 } from 'lucide-react'
import { useMemo } from 'react'

import { useTTS } from '~/hooks/use-tts'
import { scoreBg, scoreColor, scoreLevel } from '~/lib/passage-score'
import { cn } from '~/lib/utils'

import type { PassageSegment, WordResult } from '~/types'

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
  wordResults: WordResult[]
  resultOffset: number
}

function SegmentResult({
  segment,
  wordResults,
  resultOffset,
}: SegmentResultProps) {
  const tts = useTTS(segment.text)
  const tokens = useMemo(() => tokenizeSegment(segment.text), [segment.text])
  const wordCount = useMemo(
    () => tokens.filter((t) => t.isWord).length,
    [tokens],
  )

  const segmentScore =
    wordCount > 0
      ? Math.round(
          tokens
            .filter((t) => t.isWord)
            .reduce(
              (acc, t) =>
                acc + (wordResults[resultOffset + t.wordIdx]?.score ?? 100),
              0,
            ) / wordCount,
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
          {tokens.map((tok) => {
            if (!tok.isWord) {
              return (
                <span key={tok.key} className="text-[#8a8f98]">
                  {tok.text}
                </span>
              )
            }

            const wr = wordResults[resultOffset + tok.wordIdx]
            if (!wr) {
              return (
                <span key={tok.key} className="text-[#8a8f98]">
                  {tok.text}
                </span>
              )
            }

            return (
              <span
                key={tok.key}
                title={wr.got ? `Bạn nói: "${wr.got}"` : 'Bỏ qua'}
                className={cn(
                  'cursor-help rounded px-0.5 transition-colors',
                  scoreColor(wr.score),
                  scoreBg(wr.score),
                )}
              >
                {tok.text}
              </span>
            )
          })}
        </p>

        {segmentScore < 85 && (
          <div className="mt-2 text-xs text-[#8a8f98]">
            {tokens
              .filter((t) => t.isWord)
              .map((t) => {
                const r = wordResults[resultOffset + t.wordIdx]
                if (!r || r.score >= 85) return null
                return (
                  <span key={t.key} className="mr-2">
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
  wordResults: WordResult[]
  score: number
  elapsed: number
  benchmarkTime: number | null
}

export function ExamResults({
  segments,
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

  const segmentOffsets = useMemo(() => {
    const counts = segments.map(
      (seg) => (seg.text.match(/\b[\w']+\b/g) ?? []).length,
    )
    return counts.map((_, i) => counts.slice(0, i).reduce((s, c) => s + c, 0))
  }, [segments])

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
            wordResults={wordResults}
            resultOffset={segmentOffsets[i] ?? 0}
          />
        ))}
      </div>
    </div>
  )
}
