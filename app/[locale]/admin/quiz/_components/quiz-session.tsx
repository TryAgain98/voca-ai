'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useCallback } from 'react'

import { MCQExerciseCard } from '~admin/review/_components/exercises/mcq-exercise'
import { SpeechExerciseCard } from '~admin/review/_components/exercises/speech-exercise'
import { TypingExerciseCard } from '~admin/review/_components/exercises/typing-exercise'
import { ExitConfirmDialog } from '~admin/review/_components/exit-confirm-dialog'

import { useQuizSession } from '../_hooks/use-quiz-session'

import { QuizResults } from './quiz-results'

import type { QuizSetup } from '../_types/quiz.types'
import type { Exercise } from '~admin/review/_types/review.types'

function renderExercise(
  exercise: Exercise,
  index: number,
  onAnswer: (isCorrect: boolean, userAnswer?: string) => void,
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

interface QuizSessionViewProps {
  setup: QuizSetup
  onExit: () => void
}

export function QuizSessionView({ setup, onExit }: QuizSessionViewProps) {
  const t = useTranslations('Quiz')

  const {
    currentExercise,
    currentIndex,
    total,
    results,
    isComplete,
    startTime,
    endTime,
    submitAnswer,
  } = useQuizSession(setup)

  const handleAnswer = useCallback(
    (isCorrect: boolean, userAnswer?: string) => {
      submitAnswer(isCorrect, userAnswer)
    },
    [submitAnswer],
  )

  if (isComplete && endTime) {
    const elapsedSeconds = Math.round(
      (endTime.getTime() - startTime.getTime()) / 1000,
    )
    return (
      <QuizResults
        setup={setup}
        results={results}
        startTime={startTime}
        elapsedSeconds={elapsedSeconds}
        onPlayAgain={onExit}
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
            {t('progress', { current: currentIndex + 1, total })}
          </span>
          <ExitConfirmDialog onConfirm={onExit} />
        </div>
        <div className="bg-muted h-1.5 w-full rounded-full">
          <motion.div
            className="bg-primary h-1.5 rounded-full"
            animate={{ width: `${(currentIndex / total) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {renderExercise(currentExercise, currentIndex, handleAnswer)}
    </div>
  )
}
