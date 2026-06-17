'use client'

import { CheckCircle2, RefreshCw, Sparkles, XCircle } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

import type { WritingScoreResult } from '~/providers/ai/types'

interface WritingResultProps {
  result: WritingScoreResult
  userSentence: string
  isViewingPrevious?: boolean
  onRetry: () => void
}

const SCORE_THRESHOLDS = { good: 80, ok: 60 }

function ScoreRing({ score, label }: { score: number; label: string }) {
  const isGood = score >= SCORE_THRESHOLDS.good
  const isOk = score >= SCORE_THRESHOLDS.ok

  const color = isGood
    ? 'text-emerald-400 stroke-emerald-400'
    : isOk
      ? 'text-yellow-400 stroke-yellow-400'
      : 'text-red-400 stroke-red-400'

  const bgColor = isGood
    ? 'bg-emerald-400/10'
    : isOk
      ? 'bg-yellow-400/10'
      : 'bg-red-400/10'

  const radius = 28
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          'relative flex size-[72px] items-center justify-center rounded-full',
          bgColor,
        )}
      >
        <svg className="absolute inset-0 -rotate-90" width="72" height="72">
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            strokeWidth="4"
            className="stroke-border"
          />
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className={color}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <span
          className={cn('text-xl font-bold tabular-nums', color.split(' ')[0])}
        >
          {score}
        </span>
      </div>
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
    </div>
  )
}

function FeedbackRow({
  isGood,
  label,
  feedback,
}: {
  isGood: boolean
  label: string
  feedback: string
}) {
  return (
    <div className="flex gap-3">
      {isGood ? (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
      ) : (
        <XCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
      )}
      <div className="flex flex-col gap-0.5">
        <span className="text-foreground text-sm font-medium">{label}</span>
        <span className="text-muted-foreground text-sm">{feedback}</span>
      </div>
    </div>
  )
}

export function WritingResult({
  result,
  userSentence,
  isViewingPrevious = false,
  onRetry,
}: WritingResultProps) {
  const t = useTranslations('Writing')
  const locale = useLocale()
  const totalScore = Math.round(
    (result.grammar_score + result.relevance_score) / 2,
  )

  const isGoodGrammar = result.grammar_score >= SCORE_THRESHOLDS.good
  const isGoodRelevance = result.relevance_score >= SCORE_THRESHOLDS.good

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-5 duration-500">
      <div className="border-border bg-card flex flex-col items-center gap-4 rounded-2xl border p-6">
        <div className="flex items-center gap-8">
          <ScoreRing score={result.grammar_score} label={t('grammarScore')} />
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-foreground text-3xl font-bold tabular-nums">
              {totalScore}
            </span>
            <span className="text-muted-foreground text-xs font-medium">
              {t('totalScore')}
            </span>
          </div>
          <ScoreRing
            score={result.relevance_score}
            label={t('relevanceScore')}
          />
        </div>
      </div>

      <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5">
        <h3 className="text-foreground text-sm font-semibold">
          {t('feedbackTitle')}
        </h3>
        <FeedbackRow
          isGood={isGoodGrammar}
          label={t('grammar')}
          feedback={
            locale === 'vi'
              ? result.grammar_feedback.vi
              : result.grammar_feedback.en
          }
        />
        <FeedbackRow
          isGood={isGoodRelevance}
          label={t('relevance')}
          feedback={
            locale === 'vi'
              ? result.relevance_feedback.vi
              : result.relevance_feedback.en
          }
        />
      </div>

      <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5">
        <h3 className="text-foreground text-sm font-semibold">
          {t('sentencesTitle')}
        </h3>

        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {t('yourSentence')}
          </span>
          <p className="text-foreground text-sm leading-relaxed">
            {userSentence}
          </p>
        </div>

        <div className="border-border border-t pt-3">
          <span className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase">
            {t('improvedSentence')}
          </span>
          <p className="text-foreground text-sm leading-relaxed">
            {result.improved_sentence}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 rounded-xl bg-indigo-500/10 p-3">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-xs font-semibold tracking-wide text-indigo-400 uppercase">
              {t('idealSentence')}
            </span>
          </div>
          <p className="text-foreground text-sm leading-relaxed">
            {result.ideal_sentence}
          </p>
          {result.ideal_sentence_vi && (
            <p className="text-xs leading-relaxed text-indigo-300/70">
              {result.ideal_sentence_vi}
            </p>
          )}
        </div>
      </div>

      <Button variant="outline" onClick={onRetry} className="w-full gap-2">
        <RefreshCw size={15} />
        {isViewingPrevious ? t('retake') : t('tryAgain')}
      </Button>
    </div>
  )
}
