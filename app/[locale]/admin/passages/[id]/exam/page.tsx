'use client'

import { useUser } from '@clerk/nextjs'
import { ArrowLeft, Loader2, Mic, RefreshCw, Save, Square } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'

import { Button } from '~/components/ui/button'
import { usePassage } from '~/hooks/use-passages'
import { scoreColor } from '~/lib/passage-score'
import { cn } from '~/lib/utils'

import { ExamResults } from './_components/exam-results'
import { useExamSession } from './_hooks/use-exam-session'

import type { BenchmarkKey } from './_hooks/use-exam-session'

const BENCHMARKS: { key: BenchmarkKey; label: string; color: string }[] = [
  { key: 'good', label: 'Tốt', color: 'text-emerald-400' },
  { key: 'ok', label: 'Ổn', color: 'text-amber-400' },
  { key: 'acceptable', label: 'Chấp nhận', color: 'text-orange-400' },
]

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function ExamPage() {
  const params = useParams()
  const locale = useLocale()
  const { user } = useUser()
  const passageId = params.id as string

  const { data: passage, isLoading } = usePassage(passageId)
  const exam = useExamSession(
    passage?.content ?? '',
    passage?.time_good ?? null,
    passage?.time_ok ?? null,
    passage?.time_acceptable ?? null,
  )

  const benchmarkTime =
    exam.selectedBenchmark === 'good'
      ? passage?.time_good
      : exam.selectedBenchmark === 'ok'
        ? passage?.time_ok
        : passage?.time_acceptable

  if (isLoading || !passage) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5e6ad2] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/admin/passages/${passageId}/practice`}>
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-[#f7f8f8]">
            {passage.title}
          </h1>
          <p className="text-xs text-[#8a8f98]">Chế độ thi — không có gợi ý</p>
        </div>
        {exam.state === 'recording' && (
          <div
            className={cn(
              'flex items-center gap-2 font-mono text-sm',
              exam.elapsed > (benchmarkTime ?? 999)
                ? 'text-red-400'
                : 'text-[#d0d6e0]',
            )}
          >
            <div className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
            {formatTime(exam.elapsed)}
          </div>
        )}
      </div>

      {exam.state === 'idle' && (
        <>
          {(passage.time_good ||
            passage.time_ok ||
            passage.time_acceptable) && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[#8a8f98]">Chọn mốc thời gian:</p>
              <div className="flex gap-2">
                {BENCHMARKS.filter(({ key }) =>
                  key === 'good'
                    ? passage.time_good
                    : key === 'ok'
                      ? passage.time_ok
                      : passage.time_acceptable,
                ).map(({ key, label, color }) => {
                  const time =
                    key === 'good'
                      ? passage.time_good
                      : key === 'ok'
                        ? passage.time_ok
                        : passage.time_acceptable
                  return (
                    <button
                      key={key}
                      onClick={() => exam.setSelectedBenchmark(key)}
                      className={cn(
                        'flex flex-col items-center gap-0.5 rounded-lg border px-4 py-2 text-sm transition-colors',
                        exam.selectedBenchmark === key
                          ? 'border-[#5e6ad2] bg-[#5e6ad2]/15'
                          : 'border-white/8 bg-white/2 hover:border-white/15',
                      )}
                    >
                      <span className={cn('font-semibold', color)}>
                        {label}
                      </span>
                      <span className="text-xs text-[#8a8f98]">{time}s</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div
            className="rounded-xl border p-4 leading-relaxed text-[#d0d6e0]"
            style={{
              background: 'rgba(255,255,255,0.02)',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            {passage.content}
          </div>

          <Button
            onClick={exam.startRecording}
            className="w-full gap-2 bg-red-500 text-white hover:bg-red-400"
          >
            <Mic size={16} />
            Bắt đầu thi
          </Button>
        </>
      )}

      {exam.state === 'recording' && (
        <>
          <div
            className="rounded-xl border p-4 leading-relaxed text-[#d0d6e0]"
            style={{
              background: 'rgba(255,255,255,0.02)',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            {passage.content}
          </div>

          <Button
            onClick={exam.stopAndScore}
            variant="outline"
            className="w-full gap-2 border-red-400/40 text-red-400 hover:bg-red-400/10"
          >
            <Square size={14} />
            Dừng và chấm điểm
          </Button>
        </>
      )}

      {exam.state === 'scoring' && (
        <div className="flex flex-col items-center gap-3 py-16">
          <Loader2 size={32} className="animate-spin text-[#5e6ad2]" />
          <p className="text-sm text-[#8a8f98]">Đang chấm điểm...</p>
        </div>
      )}

      {exam.state === 'done' && exam.wordResults && (
        <>
          <ExamResults
            segments={passage.segments}
            wordTags={passage.word_tags}
            wordResults={exam.wordResults}
            score={exam.score}
            elapsed={exam.elapsed}
            benchmarkTime={benchmarkTime ?? null}
          />

          <div className="flex gap-3">
            <Button variant="outline" onClick={exam.reset} className="gap-2">
              <RefreshCw size={16} />
              Thi lại
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={() => exam.saveResult(passageId, user?.id ?? '')}
            >
              <Save size={16} />
              Lưu kết quả
              {exam.score > 0 && (
                <span className={cn('ml-1 font-bold', scoreColor(exam.score))}>
                  ({exam.score})
                </span>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
