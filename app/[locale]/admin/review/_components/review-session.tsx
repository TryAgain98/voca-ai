'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useSubmitAnswer } from '~/hooks/use-word-review-progress'

import { useReviewSession } from '../_hooks/use-review-session'

import { MCQExerciseCard } from './exercises/mcq-exercise'
import { SpeechExerciseCard } from './exercises/speech-exercise'
import { TypingExerciseCard } from './exercises/typing-exercise'
import { ExitConfirmDialog } from './exit-confirm-dialog'
import { ReviewResults } from './review-results'

import type { Exercise, ReviewSetup } from '../_types/review.types'

function renderExercise(
  exercise: Exercise,
  index: number,
  onAnswer: (ok: boolean) => void,
) {
  switch (exercise.type) {
    case 'word-to-meaning':
      return (
        <MCQExerciseCard key={index} exercise={exercise} onAnswer={onAnswer} />
      )
    case 'speak-word':
      return (
        <SpeechExerciseCard
          key={index}
          exercise={exercise}
          onAnswer={onAnswer}
        />
      )
    default:
      return (
        <TypingExerciseCard
          key={index}
          exercise={exercise}
          onAnswer={onAnswer}
        />
      )
  }
}

interface ReviewSessionViewProps {
  setup: ReviewSetup
  onExit: () => void
}

export function ReviewSessionView({ setup, onExit }: ReviewSessionViewProps) {
  const t = useTranslations('Review')
  const startTime = useRef(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    startTime.current = Date.now()
  }, [])

  const {
    currentExercise,
    currentIndex,
    totalQueued,
    results,
    isComplete,
    submitAnswer,
  } = useReviewSession(setup)

  const { mutate: persistAnswer } = useSubmitAnswer()

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      if (!currentExercise) return
      if (!currentExercise.isReinforcement) {
        persistAnswer({
          userId: setup.userId,
          wordId: currentExercise.vocab.id,
          isCorrect,
        })
      }
      submitAnswer(isCorrect)
    },
    [currentExercise, persistAnswer, setup.userId, submitAnswer],
  )

  useEffect(() => {
    if (isComplete) {
      setElapsedSeconds(Math.round((Date.now() - startTime.current) / 1000))
    }
  }, [isComplete])

  if (isComplete) {
    return (
      <ReviewResults
        results={results}
        elapsedSeconds={elapsedSeconds}
        onRestart={onExit}
        onChangeSetup={onExit}
      />
    )
  }

  if (!currentExercise) return null

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            {t('progress', { current: currentIndex + 1, total: totalQueued })}
          </span>
          <div className="flex items-center gap-3">
            {currentExercise.isReinforcement && (
              <span className="text-amber-400">{t('reinforcement')}</span>
            )}
            <ExitConfirmDialog onConfirm={onExit} />
          </div>
        </div>
        <div className="bg-muted h-1.5 w-full rounded-full">
          <motion.div
            className="bg-primary h-1.5 rounded-full"
            animate={{ width: `${(currentIndex / totalQueued) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {renderExercise(currentExercise, currentIndex, handleAnswer)}
    </div>
  )
}
