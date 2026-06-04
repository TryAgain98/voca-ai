'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Volume2, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { useTTS } from '~/hooks/use-tts'
import {
  calculatePassageExamScore,
  evaluatePassageExamOutcome,
  normalizePunctuation,
  scoreBg,
  scoreColor,
} from '~/lib/passage-score'
import { segmentsFromContent } from '~/lib/passage-segments'
import { cn } from '~/lib/utils'

import { WordInfoPopup } from '../../practice/_components/word-info-popup'
import { PassageLookupContext } from '../../practice/_utils/passage-lookup-context'

import type {
  PassageLookupState,
  PassageWordDetail,
} from '../../practice/_utils/passage-lookup-context'
import type { WordDetailsBatchResponse } from '~/app/api/word-details-batch/route'
import type { WordLookup } from '~/providers/ai'
import type { PassageSegment, WordResult } from '~/types'

interface SegmentToken {
  text: string
  isWord: boolean
  wordIdx: number
  key: string
}

function tokenizeSegment(rawText: string): SegmentToken[] {
  const text = normalizePunctuation(rawText)
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

const passageCache = new Map<string, Map<string, PassageWordDetail>>()
const passageInFlight = new Map<string, Promise<void>>()

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
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

            const isMissing = !wr.got

            return (
              <WordInfoPopup key={tok.key} word={tok.text}>
                <span
                  title={isMissing ? 'Chưa đọc' : `Bạn nói: "${wr.got}"`}
                  className={cn(
                    'cursor-pointer rounded px-0.5 underline-offset-2 transition-colors hover:underline',
                    isMissing
                      ? 'bg-white/5 text-[#8a8f98]'
                      : [scoreColor(wr.score), scoreBg(wr.score)],
                  )}
                >
                  {tok.text}
                </span>
              </WordInfoPopup>
            )
          })}
        </p>
      </div>

      <span
        className={cn(
          'shrink-0 text-sm font-semibold',
          scoreColor(segmentScore),
        )}
      >
        {segmentScore}
      </span>
    </motion.div>
  )
}

interface ExamResultsProps {
  content: string
  wordResults: WordResult[]
  score: number
  scoreLabel?: string
  pronunciationScore: number
  elapsed: number
  benchmarkTime: number | null
}

export function ExamResults({
  content,
  wordResults,
  score,
  scoreLabel = 'điểm tham khảo',
  pronunciationScore,
  elapsed,
  benchmarkTime,
}: ExamResultsProps) {
  const [lookupState, setLookupState] = useState<PassageLookupState>(() => {
    const cached = passageCache.get(content)
    return { detailMap: cached ?? new Map(), isLoading: !cached }
  })

  const examScore = calculatePassageExamScore(
    pronunciationScore,
    elapsed,
    benchmarkTime,
  )
  const outcome = evaluatePassageExamOutcome(
    wordResults,
    elapsed,
    benchmarkTime,
  )

  const outcomeReasons = [
    outcome.missingCount > 0 ? `${outcome.missingCount} từ chưa đọc` : null,
    outcome.incorrectCount > 0
      ? `${outcome.incorrectCount} từ chưa đúng`
      : null,
    outcome.overTime ? 'quá thời gian cho phép' : null,
  ].filter(Boolean)

  const segments = useMemo(() => segmentsFromContent(content), [content])

  const segmentOffsets = useMemo(() => {
    const counts = segments.map(
      (seg) =>
        (normalizePunctuation(seg.text).match(/\b[\w']+\b/g) ?? []).length,
    )
    return counts.map((_, i) => counts.slice(0, i).reduce((s, c) => s + c, 0))
  }, [segments])

  useEffect(() => {
    const cached = passageCache.get(content)
    if (cached) {
      return
    }

    const doFetch = async (): Promise<void> => {
      try {
        const res = await fetch('/api/word-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passageText: content }),
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

        passageCache.set(content, detailMap)
        setLookupState({ detailMap, isLoading: false })
      } catch {
        const empty = new Map<string, PassageWordDetail>()
        passageCache.set(content, empty)
        setLookupState({ detailMap: empty, isLoading: false })
      } finally {
        passageInFlight.delete(content)
      }
    }

    const existing = passageInFlight.get(content)
    if (existing) {
      void existing.then(() => {
        const latest =
          passageCache.get(content) ?? new Map<string, PassageWordDetail>()
        setLookupState({ detailMap: latest, isLoading: false })
      })
      return
    }

    const promise = doFetch()
    passageInFlight.set(content, promise)
  }, [content])

  return (
    <PassageLookupContext.Provider value={lookupState}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col gap-4"
      >
        <div
          className={cn(
            'flex items-center gap-6 rounded-xl border p-5',
            outcome.passed ? 'border-emerald-400/20' : 'border-red-400/20',
          )}
          style={{
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <div
            className={cn(
              'flex size-16 shrink-0 items-center justify-center rounded-full',
              outcome.passed
                ? 'bg-emerald-400/10 text-emerald-400'
                : 'bg-red-400/10 text-red-400',
            )}
          >
            {outcome.passed ? (
              <CheckCircle2 size={34} />
            ) : (
              <XCircle size={34} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'text-xl font-semibold',
                outcome.passed ? 'text-emerald-400' : 'text-red-400',
              )}
            >
              {outcome.passed ? 'Đạt' : 'Chưa đạt'}
            </p>
            <p className="mt-1 text-sm text-[#8a8f98]">
              {outcome.passed
                ? 'Bạn đã đọc đúng, đủ và trong thời gian cho phép.'
                : outcomeReasons.length > 0
                  ? `Cần thi lại: ${outcomeReasons.join(', ')}.`
                  : 'Cần thi lại để đạt đủ điều kiện.'}
            </p>
            <p className="mt-1 text-xs text-[#8a8f98]">
              Thời gian: {elapsed}s
              {benchmarkTime ? ` / mốc: ${benchmarkTime}s` : ''}
            </p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className={cn('text-5xl font-bold', scoreColor(score))}>
              {score}
            </span>
            <span className="text-xs text-[#8a8f98]">{scoreLabel}</span>
          </div>
          {pronunciationScore !== score && (
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  'text-5xl font-bold',
                  scoreColor(pronunciationScore),
                )}
              >
                {pronunciationScore}
              </span>
              <span className="text-xs text-[#8a8f98]">phát âm</span>
            </div>
          )}
          {benchmarkTime !== null && (
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  'text-5xl font-bold',
                  examScore.timePenalty > 0
                    ? 'text-red-400'
                    : 'text-emerald-400',
                )}
              >
                {examScore.timePenalty > 0 ? `-${examScore.timePenalty}` : '✓'}
              </span>
              <span className="text-xs text-[#8a8f98]">thời gian</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-white/8 bg-white/2 px-3 py-2 text-xs text-[#8a8f98]">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400" />
            đúng
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-400" />
            gần đúng
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-red-400" />
            đọc sai
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#8a8f98]" />
            chưa đọc
          </span>
          <span className="ml-auto">Click vào từ để nghe và xem nghĩa.</span>
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
      </motion.div>
    </PassageLookupContext.Provider>
  )
}
