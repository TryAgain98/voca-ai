'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { SpeakButton } from '~/components/layout/speak-button'
import { cn } from '~/lib/cn'

import type { QuizExerciseResult } from '../../_types/quiz.types'
import type { Exercise } from '~admin/review/_types/review.types'

type FilterMode = 'all' | 'mistakes'

interface AnswersBreakdownProps {
  results: QuizExerciseResult[]
}

function getExpectedAnswer(exercise: Exercise): string {
  // word-to-meaning: question was the word, expected = meaning.
  // Other types (typing/listening/speaking): expected = the word itself.
  return exercise.type === 'word-to-meaning'
    ? exercise.vocab.meaning
    : exercise.vocab.word
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

interface AnswerRowProps {
  result: QuizExerciseResult
  index: number
}

function AnswerRow({ result, index }: AnswerRowProps) {
  const t = useTranslations('Quiz.results')
  const expected = getExpectedAnswer(result.exercise)
  const isCorrect = result.isCorrect

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className={cn(
        'flex items-start gap-2.5 rounded-lg border px-3 py-2',
        isCorrect
          ? 'border-emerald-500/15 bg-emerald-500/[0.04]'
          : 'border-rose-500/20 bg-rose-500/[0.05]',
      )}
    >
      {isCorrect ? (
        <CheckCircle2
          size={16}
          className="mt-0.5 shrink-0 text-emerald-500"
          strokeWidth={2}
        />
      ) : (
        <XCircle
          size={16}
          className="mt-0.5 shrink-0 text-rose-500"
          strokeWidth={2}
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-foreground text-sm font-[590]">
            {result.exercise.vocab.word}
          </span>
          <SpeakButton
            text={result.exercise.vocab.word}
            className="-my-1 size-6"
          />
          <span className="text-muted-foreground text-xs">
            — {result.exercise.vocab.meaning}
          </span>
        </div>
        {!isCorrect && (
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
            <span className="text-emerald-500">
              <span className="text-muted-foreground/80">
                {t('expected')}:{' '}
              </span>
              <span className="font-[510]">{expected}</span>
            </span>
            {result.userAnswer && (
              <span className="text-rose-400">
                <span className="text-muted-foreground/80">
                  {t('yourAnswer')}:{' '}
                </span>
                <span className="font-[510] line-through">
                  {result.userAnswer}
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
