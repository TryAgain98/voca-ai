'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Clock, RefreshCw, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'

import type { MCResult } from '~/app/[locale]/admin/quiz/_types/quiz.types'

interface QuizResultsProps {
  mode: 'multiple-choice' | 'matching'
  mcResults?: MCResult[]
  matchScore?: number
  elapsedSeconds: number
  onPlayAgain: () => void
  onChangeSetup: () => void
}

export function QuizResults({
  mode,
  mcResults = [],
  matchScore = 0,
  elapsedSeconds,
  onPlayAgain,
  onChangeSetup,
}: QuizResultsProps) {
  const t = useTranslations('Quiz')

  const correctCount = mcResults.filter((r) => r.isCorrect).length
  const mistakes = mcResults.filter((r) => !r.isCorrect)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto flex max-w-lg flex-col gap-6"
    >
      <div className="bg-card rounded-2xl border px-8 py-8 text-center shadow-sm">
        <p className="text-muted-foreground mb-2 text-sm font-medium tracking-wider uppercase">
          {t('resultsTitle')}
        </p>
        <p className="text-primary text-5xl font-bold">
          {mode === 'multiple-choice'
            ? t('resultsMCScore', {
                correct: correctCount,
                total: mcResults.length,
              })
            : t('resultsMatchScore', { score: matchScore })}
        </p>
        <div className="text-muted-foreground mt-3 flex items-center justify-center gap-1 text-sm">
          <Clock size={14} />
          {t('resultsTime', { seconds: elapsedSeconds })}
        </div>
      </div>

      {/* Mistakes list */}
      {mode === 'multiple-choice' && mistakes.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">{t('mistakesTitle')}</p>
          {mistakes.map((r, i) => (
            <div key={i} className="rounded-xl border px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <XCircle size={14} className="shrink-0 text-red-500" />
                <span className="font-semibold">{r.question.vocab.word}</span>
              </div>
              <div className="mt-1.5 space-y-0.5 pl-5">
                <div className="text-muted-foreground text-xs">
                  Your answer:{' '}
                  <span className="text-red-500">
                    {r.selectedIndex !== null
                      ? r.question.options[r.selectedIndex]
                      : '—'}
                  </span>
                </div>
                <div className="text-muted-foreground text-xs">
                  Correct:{' '}
                  <span className="flex inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle2 size={11} />
                    {r.question.options[r.question.correctIndex]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onChangeSetup}>
          {t('changeSetup')}
        </Button>
        <Button className="flex-1 gap-2" onClick={onPlayAgain}>
          <RefreshCw size={14} />
          {t('playAgain')}
        </Button>
      </div>
    </motion.div>
  )
}
