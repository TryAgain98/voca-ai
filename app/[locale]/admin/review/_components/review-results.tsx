'use client'

import { motion } from 'framer-motion'
import { RefreshCw, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'

import type { ExerciseResult } from '../_types/review.types'

interface ReviewResultsProps {
  results: ExerciseResult[]
  elapsedSeconds: number
  onRestart: () => void
  onChangeSetup: () => void
}

export function ReviewResults({
  results,
  elapsedSeconds,
  onRestart,
  onChangeSetup,
}: ReviewResultsProps) {
  const t = useTranslations('Review')

  const originals = results.filter((r) => !r.exercise.isReinforcement)
  const correct = originals.filter((r) => r.isCorrect)
  const mistakes = originals.filter((r) => !r.isCorrect)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto flex max-w-lg flex-col gap-6"
    >
      <div className="bg-card rounded-2xl border px-8 py-8 text-center">
        <p className="text-muted-foreground mb-2 text-sm font-medium tracking-wider uppercase">
          {t('resultsTitle')}
        </p>
        <p className="text-primary text-5xl font-bold">
          {correct.length} / {originals.length}
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          {t('resultsTime', { seconds: elapsedSeconds })}
        </p>
      </div>

      {mistakes.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">{t('mistakesTitle')}</p>
          {mistakes.map((r, i) => (
            <div key={i} className="rounded-xl border px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <XCircle size={14} className="shrink-0 text-red-500" />
                <span className="font-semibold">{r.exercise.vocab.word}</span>
              </div>
              <p className="text-muted-foreground mt-1 pl-5 text-xs">
                {r.exercise.vocab.meaning}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onChangeSetup}>
          {t('changeSetup')}
        </Button>
        <Button className="flex-1 gap-2" onClick={onRestart}>
          <RefreshCw size={14} />
          {t('playAgain')}
        </Button>
      </div>
    </motion.div>
  )
}
