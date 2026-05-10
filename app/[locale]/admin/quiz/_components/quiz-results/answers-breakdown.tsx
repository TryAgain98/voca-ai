'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { cn } from '~/lib/cn'

import { AnswerRow } from './answer-row'

import type { QuizExerciseResult } from '../../_types/quiz.types'

type FilterMode = 'all' | 'mistakes'

interface AnswersBreakdownProps {
  results: QuizExerciseResult[]
}

export function AnswersBreakdown({ results }: AnswersBreakdownProps) {
  const t = useTranslations('Quiz.results')
  const [mode, setMode] = useState<FilterMode>('all')

  const total = results.length
  const mistakeCount = results.filter((r) => !r.isCorrect).length
  const visible =
    mode === 'mistakes' ? results.filter((r) => !r.isCorrect) : results

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="border-border bg-card rounded-2xl border p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-foreground text-sm font-[590]">
          {t('breakdownTitle')}
        </p>
        <div className="border-border bg-muted/40 inline-flex rounded-full border p-0.5 text-[11px] font-[510]">
          <FilterTab
            active={mode === 'all'}
            onClick={() => setMode('all')}
            label={t('filterAll', { count: total })}
          />
          <FilterTab
            active={mode === 'mistakes'}
            onClick={() => setMode('mistakes')}
            label={t('filterMistakes', { count: mistakeCount })}
            danger
          />
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col gap-1.5"
        >
          {visible.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              {t('noMistakes')}
            </p>
          ) : (
            visible.map((r, i) => (
              <AnswerRow
                key={`${r.exercise.vocab.id}-${i}`}
                result={r}
                index={i}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

interface FilterTabProps {
  active: boolean
  onClick: () => void
  label: string
  danger?: boolean
}

function FilterTab({ active, onClick, label, danger }: FilterTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 transition-colors',
        active
          ? danger
            ? 'bg-rose-500/15 text-rose-500'
            : 'bg-primary/15 text-primary'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}
