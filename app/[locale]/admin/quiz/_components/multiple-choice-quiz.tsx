'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useCallback } from 'react'

import { useMultipleChoice } from '~/app/[locale]/admin/quiz/_hooks/use-multiple-choice'
import { SpeakButton } from '~/components/layout/speak-button'
import { cn } from '~/lib/cn'

import type {
  MCResult,
  QuizVocab,
} from '~/app/[locale]/admin/quiz/_types/quiz.types'

interface MultipleChoiceQuizProps {
  vocab: QuizVocab[]
  onFinish: (results: MCResult[]) => void
}

export function MultipleChoiceQuiz({
  vocab,
  onFinish,
}: MultipleChoiceQuizProps) {
  const t = useTranslations('Quiz')
  const stableFinish = useCallback(
    (results: MCResult[]) => onFinish(results),
    [onFinish],
  )
  const { question, currentIndex, total, selected, select } = useMultipleChoice(
    vocab,
    stableFinish,
  )

  if (!question) return null

  const getOptionStyle = (idx: number) => {
    if (selected === null)
      return 'border-border hover:border-primary/60 hover:bg-primary/5'
    if (idx === question.correctIndex)
      return 'border-green-500 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300'
    if (idx === selected)
      return 'border-red-400 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
    return 'border-border opacity-40'
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {t('questionProgress', { current: currentIndex + 1, total })}
          </span>
        </div>
        <div className="bg-muted h-1.5 w-full rounded-full">
          <motion.div
            className="bg-primary h-1.5 rounded-full"
            animate={{ width: `${(currentIndex / total) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Word card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.vocab.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.2 }}
          className="bg-card rounded-2xl border px-8 py-10 text-center shadow-sm"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-bold tracking-tight">
              {question.vocab.word}
            </span>
            <SpeakButton text={question.vocab.word} className="mt-1" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt, idx) => (
          <motion.button
            key={idx}
            whileTap={{ scale: selected === null ? 0.97 : 1 }}
            onClick={() => select(idx)}
            disabled={selected !== null}
            className={cn(
              'rounded-xl border-2 px-4 py-4 text-left text-sm font-medium transition-all',
              getOptionStyle(idx),
            )}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
