'use client'

import { Mic, Play, RefreshCw, Square } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import { scoreColor, scoreLevel } from '~/lib/passage-score'
import { cn } from '~/lib/utils'

import type { PracticeState } from '../_hooks/use-practice-session'

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

interface PracticeRecorderProps {
  state: PracticeState
  score: number
  elapsedSeconds: number
  audioUrl: string | null
  isSupported: boolean
  onStart: () => void
  onStop: () => void
  onReset: () => void
}

export function PracticeRecorder({
  state,
  score,
  elapsedSeconds,
  audioUrl,
  isSupported,
  onStart,
  onStop,
  onReset,
}: PracticeRecorderProps) {
  const t = useTranslations('Passages')
  const level = scoreLevel(score)

  const motivationTitle =
    level === 'good'
      ? t('motivationGoodTitle')
      : level === 'ok'
        ? t('motivationOkTitle')
        : t('motivationPoorTitle')

  const motivationHint =
    level === 'good'
      ? t('motivationGoodHint')
      : level === 'ok'
        ? t('motivationOkHint')
        : t('motivationPoorHint')

  return (
    <div
      className="flex flex-col gap-4 rounded-xl border p-5"
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      {state === 'scored' && (
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <span className={cn('text-4xl font-bold', scoreColor(score))}>
              {score}
            </span>
            <span className="text-xs text-[#8a8f98]">/ 100</span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-[#f7f8f8]">
              {motivationTitle}
            </p>
            <p className="text-xs text-[#8a8f98]">{motivationHint}</p>
            <p className="text-xs text-[#8a8f98]">
              {t('speakingTime')}: {formatTime(elapsedSeconds)}
            </p>
          </div>
        </div>
      )}

      {audioUrl && state === 'scored' && (
        <div className="flex items-center gap-2">
          <Play size={14} className="shrink-0 text-[#7170ff]" />
          <audio
            src={audioUrl}
            controls
            className="h-8 w-full"
            style={{ colorScheme: 'dark' }}
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        {state === 'idle' && (
          <Button
            onClick={onStart}
            disabled={!isSupported}
            className="flex-1 gap-2 bg-[#5e6ad2] text-white hover:bg-[#828fff]"
          >
            <Mic size={16} />
            {isSupported ? t('startReading') : t('browserNotSupported')}
          </Button>
        )}

        {state === 'listening' && (
          <>
            <span
              className={cn(
                'font-mono text-sm tabular-nums',
                elapsedSeconds > 0 ? 'text-[#d0d6e0]' : 'text-[#8a8f98]',
              )}
            >
              {formatTime(elapsedSeconds)}
            </span>
            <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-400" />
            <Button
              variant="outline"
              className="flex-1 gap-2 border-red-400/40 text-red-400 hover:bg-red-400/10"
              onClick={onStop}
            >
              <Square size={14} />
              {t('stopAnalyze')}
            </Button>
          </>
        )}

        {state === 'scored' && (
          <Button variant="outline" onClick={onReset} className="flex-1 gap-2">
            <RefreshCw size={16} />
            {t('retry')}
          </Button>
        )}
      </div>

      {!isSupported && (
        <p className="text-xs text-[#8a8f98]">{t('browserHint')}</p>
      )}
    </div>
  )
}
