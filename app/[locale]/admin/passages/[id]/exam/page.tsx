'use client'

import { useUser } from '@clerk/nextjs'
import {
  ArrowLeft,
  Loader2,
  Mic,
  Play,
  RefreshCw,
  Save,
  Square,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import { usePassage } from '~/hooks/use-passages'
import { scoreColor } from '~/lib/passage-score'
import { cn } from '~/lib/utils'

import { ExamResults } from './_components/exam-results'
import { useExamSession } from './_hooks/use-exam-session'

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function ExamPage() {
  const params = useParams()
  const locale = useLocale()
  const t = useTranslations('Passages')
  const { user } = useUser()
  const passageId = params.id as string

  const { data: passage, isLoading } = usePassage(passageId)
  const benchmarkTime = passage?.time_good ?? null
  const exam = useExamSession(passage?.content ?? '', benchmarkTime)

  if (isLoading || !passage) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5e6ad2] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/admin/passages/${passageId}/practice`}>
            <Button variant="ghost" size="icon" className="size-8 shrink-0">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <h1 className="text-foreground min-w-0 flex-1 truncate text-sm font-[510]">
            {passage.title}
          </h1>
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
        <div className="pl-11">
          <span
            className="rounded-full border px-2 py-0.5 text-[10px] font-[510] text-orange-400"
            style={{
              background: 'rgba(251,146,60,0.08)',
              borderColor: 'rgba(251,146,60,0.25)',
            }}
          >
            {t('examMode')}
          </span>
        </div>
      </div>

      {exam.state === 'idle' && (
        <>
          <div
            className="text-foreground rounded-xl border p-4 leading-relaxed"
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
            {t('examStart')}
          </Button>
        </>
      )}

      {exam.state === 'recording' && (
        <>
          <div
            className="text-foreground rounded-xl border p-4 leading-relaxed"
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
            {t('examStop')}
          </Button>
        </>
      )}

      {exam.state === 'scoring' && (
        <div className="flex flex-col items-center gap-3 py-16">
          <Loader2 size={32} className="animate-spin text-[#5e6ad2]" />
          <p className="text-sm text-[#8a8f98]">{t('scoring')}</p>
        </div>
      )}

      {exam.state === 'done' && exam.wordResults && (
        <>
          <ExamResults
            content={passage.content}
            wordResults={exam.wordResults}
            score={exam.score}
            pronunciationScore={exam.pronunciationScore}
            elapsed={exam.elapsed}
            benchmarkTime={benchmarkTime ?? null}
          />

          {exam.audioUrl && (
            <div
              className="flex items-center gap-2 rounded-xl border p-3"
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <Play size={14} className="shrink-0 text-[#7170ff]" />
              <span className="sr-only">{t('playback')}</span>
              <audio
                src={exam.audioUrl}
                controls
                className="h-8 w-full"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={exam.reset} className="gap-2">
              <RefreshCw size={16} />
              {t('examRetry')}
            </Button>
            {exam.isSaved ? (
              <div className="flex flex-1 items-center justify-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400">
                <Save size={16} />
                {t('savedResult')}
                {exam.score > 0 && (
                  <span className="font-bold">({exam.score})</span>
                )}
              </div>
            ) : (
              <Button
                className="flex-1 gap-2"
                onClick={() => exam.saveResult(passageId, user?.id ?? '')}
              >
                <Save size={16} />
                {t('saveResult')}
                {exam.score > 0 && (
                  <span
                    className={cn('ml-1 font-bold', scoreColor(exam.score))}
                  >
                    ({exam.score})
                  </span>
                )}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
