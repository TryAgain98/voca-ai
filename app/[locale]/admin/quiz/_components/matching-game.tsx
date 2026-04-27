'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useCallback } from 'react'

import { useMatchingGame } from '~/app/[locale]/admin/quiz/_hooks/use-matching-game'
import { cn } from '~/lib/cn'

import type { QuizVocab } from '~/app/[locale]/admin/quiz/_types/quiz.types'

interface MatchingGameProps {
  vocab: QuizVocab[]
  onFinish: (score: number) => void
}

export function MatchingGame({ vocab, onFinish }: MatchingGameProps) {
  const t = useTranslations('Quiz')
  const stableFinish = useCallback(
    (score: number) => onFinish(score),
    [onFinish],
  )
  const {
    words,
    meanings,
    selectedWordId,
    selectedMeaningId,
    wrongPair,
    matchedCount,
    total,
    combo,
    score,
    timeLeft,
    selectWord,
    selectMeaning,
  } = useMatchingGame(vocab, stableFinish)

  const cardStyle = (
    id: string,
    isMatched: boolean,
    isSelected: boolean,
    isWrong: boolean,
  ) =>
    cn(
      'rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all cursor-pointer select-none',
      isMatched &&
        'border-green-500 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 opacity-60 pointer-events-none',
      !isMatched &&
        isWrong &&
        'border-red-400 bg-red-50 dark:bg-red-950/40 text-red-600',
      !isMatched &&
        !isWrong &&
        isSelected &&
        'border-primary bg-primary/10 text-primary',
      !isMatched &&
        !isWrong &&
        !isSelected &&
        'border-border hover:border-primary/50 hover:bg-primary/5',
    )

  const timerColor =
    timeLeft <= 10
      ? 'text-red-500'
      : timeLeft <= 20
        ? 'text-amber-500'
        : 'text-primary'

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      {/* Header: timer + score + combo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className={cn('text-2xl font-bold tabular-nums', timerColor)}>
            {t('timeLeft', { seconds: timeLeft })}
          </span>
          <span className="text-muted-foreground text-sm">
            {t('matchedPairs', { matched: matchedCount, total })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {combo >= 2 && (
              <motion.span
                key={combo}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-bold text-amber-500"
              >
                {t('combo', { multiplier: Math.min(combo, 3) })}
              </motion.span>
            )}
          </AnimatePresence>
          <span className="text-lg font-bold">{score}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-muted h-1.5 w-full rounded-full">
        <motion.div
          className="bg-primary h-1.5 rounded-full"
          animate={{ width: `${(matchedCount / total) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Words column */}
        <div className="flex flex-col gap-2">
          {words.map((w) => {
            const isSelected = selectedWordId === w.id
            const isWrong = wrongPair?.wordId === w.id
            return (
              <motion.button
                key={w.id}
                layout
                whileTap={{ scale: w.isMatched ? 1 : 0.97 }}
                animate={isWrong ? { x: [-4, 4, -4, 4, 0] } : { x: 0 }}
                transition={isWrong ? { duration: 0.3 } : undefined}
                onClick={() => selectWord(w.id)}
                className={cardStyle(w.id, w.isMatched, isSelected, isWrong)}
              >
                {w.word}
              </motion.button>
            )
          })}
        </div>

        {/* Meanings column */}
        <div className="flex flex-col gap-2">
          {meanings.map((m) => {
            const isSelected = selectedMeaningId === m.id
            const isWrong = wrongPair?.meaningId === m.id
            return (
              <motion.button
                key={m.id}
                layout
                whileTap={{ scale: m.isMatched ? 1 : 0.97 }}
                animate={isWrong ? { x: [-4, 4, -4, 4, 0] } : { x: 0 }}
                transition={isWrong ? { duration: 0.3 } : undefined}
                onClick={() => selectMeaning(m.id)}
                className={cardStyle(m.id, m.isMatched, isSelected, isWrong)}
              >
                {m.meaning}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
