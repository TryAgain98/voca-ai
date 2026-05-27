'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { Button } from '~/components/ui/button'
import { WordTypeBadge } from '~/components/word-type-badge'
import { cn } from '~/lib/cn'
import { diffQuizAnswer } from '~/lib/quiz-answer-diff'

import type { QuizAnswerDiffOp } from '~/types'

interface ExerciseFeedbackProps {
  show: boolean
  isCorrect: boolean
  onContinue: () => void
  correctAnswer?: string
  correctWordType?: string | null
  synonyms?: string[]
  userAnswer?: string
}

function formatDiffChar(char: string): string {
  return char === ' ' ? '·' : char
}

function DiffHighlight({
  expected,
  actual,
}: {
  expected: string
  actual: string
}) {
  const ops = diffQuizAnswer(expected, actual)
  return (
    <span className="font-mono text-sm font-[510] wrap-break-word">
      {ops.map((op: QuizAnswerDiffOp, i: number) => (
        <span
          key={`${op.type}-${i}`}
          className={cn(
            op.type === 'match' && 'text-foreground',
            op.type === 'wrong' && 'text-rose-500',
            op.type === 'missing' && 'text-muted-foreground/45',
            op.type === 'extra' &&
              'rounded bg-rose-500/10 px-0.5 text-rose-500',
          )}
        >
          {formatDiffChar(op.char)}
        </span>
      ))}
    </span>
  )
}

export function ExerciseFeedback({
  show,
  isCorrect,
  onContinue,
  correctAnswer,
  correctWordType,
  synonyms,
  userAnswer,
}: ExerciseFeedbackProps) {
  const t = useTranslations('Review')
  const showContinue = show && !isCorrect

  useEffect(() => {
    if (!showContinue) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') onContinue()
    }
    const timer = setTimeout(() => {
      window.addEventListener('keydown', handleKeyDown)
    }, 300)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showContinue, onContinue])

  return (
    <AnimatePresence>
      {show && isCorrect && (
        <motion.p
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="text-center text-lg font-semibold text-green-400"
        >
          {t('correct')}
        </motion.p>
      )}
      {showContinue && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          {correctAnswer && (
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs">
              <span className="text-muted-foreground/70">
                {t('correctAnswer')}:{' '}
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-[510] text-emerald-500">
                    {correctAnswer}
                  </span>
                  {correctWordType && (
                    <WordTypeBadge
                      value={correctWordType}
                      className="h-5 text-xs"
                    />
                  )}
                </span>
              </span>
              {userAnswer && (
                <span className="text-muted-foreground/70">
                  {t('youTyped')}:{' '}
                  <DiffHighlight expected={correctAnswer} actual={userAnswer} />
                </span>
              )}
            </div>
          )}
          {synonyms && synonyms.length > 0 && (
            <p className="text-sm">
              <span className="text-muted-foreground">
                {t('alsoAccepted')}:{' '}
              </span>
              <span className="text-muted-foreground font-medium">
                {synonyms.join(', ')}
              </span>
            </p>
          )}
          <Button onClick={onContinue} className="w-full">
            {t('continueBtn')}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
