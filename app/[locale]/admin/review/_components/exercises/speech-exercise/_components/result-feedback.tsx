'use client'

import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'

import { PhonemeDisplay } from './phoneme-display'

import type { SpeechDiff } from '../../_utils/phoneme-diff'

interface ResultFeedbackProps {
  diff: SpeechDiff
  transcript: string
  canBypass: boolean
  onRetry: () => void
  onSkip: () => void
}

export function ResultFeedback({
  diff,
  transcript,
  canBypass,
  onRetry,
  onSkip,
}: ResultFeedbackProps) {
  const t = useTranslations('Review')

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-4">
        <PhonemeDisplay tokens={diff.tokens} />
        <p className="text-muted-foreground text-sm">
          {t('youSaid')}:{' '}
          <span className="text-foreground font-mono">{transcript || '—'}</span>
        </p>
        {diff.expectedSyllables !== diff.recognizedSyllables && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400">
            <AlertTriangle size={12} />
            <span>
              {t('stressError', { expected: diff.expectedSyllables })}
            </span>
          </div>
        )}
        {diff.matchRatio >= 0.8 ? (
          <p className="text-sm text-amber-400">{t('speechClose')}</p>
        ) : (
          <p className="text-muted-foreground text-sm">{t('speechWrong')}</p>
        )}
      </div>

      {canBypass && (
        <p className="text-muted-foreground text-center text-xs">
          {t('maxAttemptsHint')}
        </p>
      )}

      <Button onClick={onRetry} variant="outline" className="w-full">
        {t('retrySpeak')}
      </Button>

      {canBypass && (
        <Button
          onClick={onSkip}
          variant="ghost"
          className="text-muted-foreground w-full"
        >
          {t('skipBtn')}
        </Button>
      )}
    </div>
  )
}
