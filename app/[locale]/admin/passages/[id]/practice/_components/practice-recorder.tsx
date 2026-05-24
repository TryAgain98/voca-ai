'use client'

import { Loader2, Mic, RefreshCw, Square } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

import type { PracticeState } from '../_hooks/use-practice-session'

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

interface PracticeRecorderProps {
  state: PracticeState
  elapsedSeconds: number
  isSupported: boolean
  onStart: () => void
  onStop: () => void
  onReset: () => void
}

export function PracticeRecorder({
  state,
  elapsedSeconds,
  isSupported,
  onStart,
  onStop,
  onReset,
}: PracticeRecorderProps) {
  const t = useTranslations('Passages')

  if (state === 'scored') {
    return (
      <div className="flex gap-3">
        <Button variant="outline" onClick={onReset} className="flex-1 gap-2">
          <RefreshCw size={16} />
          {t('retry')}
        </Button>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col gap-4 rounded-xl border p-5"
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
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

        {state === 'scoring' && (
          <Button disabled className="flex-1 gap-2">
            <Loader2 size={16} className="animate-spin" />
            {t('scoring')}
          </Button>
        )}
      </div>

      {!isSupported && (
        <p className="text-xs text-[#8a8f98]">{t('browserHint')}</p>
      )}
    </div>
  )
}
