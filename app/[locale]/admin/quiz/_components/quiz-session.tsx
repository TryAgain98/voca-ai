'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useCallback } from 'react'

import { MCQExerciseCard } from '~admin/review/_components/exercises/mcq-exercise'
import { SpeechExerciseCard } from '~admin/review/_components/exercises/speech-exercise'
import { TypingExerciseCard } from '~admin/review/_components/exercises/typing-exercise'
import { ExitConfirmDialog } from '~admin/review/_components/exit-confirm-dialog'

import { useQuizSession } from '../_hooks/use-quiz-session'

import { QuestionTimer } from './question-timer'
import { QuizResults } from './quiz-results'

import type { QuizSetup } from '../_types/quiz.types'
import type { AnswerHandler, Exercise } from '~admin/review/_types/review.types'

const QUIZ_PER_QUESTION_MS = 20000

function renderExercise(
  exercise: Exercise,
  index: number,
  onAnswer: AnswerHandler,
) {
  switch (exercise.type) {
    case 'word-to-meaning':
      return (
        <MCQExerciseCard
          key={index}
          exercise={exercise}
          onAnswer={onAnswer}
          mode="quiz"
        />
      )
    case 'speak-word':
      return (
        <SpeechExerciseCard
          key={index}
          exercise={exercise}
          onAnswer={onAnswer}
          mode="quiz"
        />
      )
    default:
      return (
        <TypingExerciseCard
          key={index}
          exercise={exercise}
          onAnswer={onAnswer}
          mode="quiz"
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

  const handleAnswer = useCallback<AnswerHandler>(
    (isCorrect, meta) => {
      submitAnswer(isCorrect, meta)
    },
    [submitAnswer],
  )

  const handleTimeout = useCallback(() => {
    submitAnswer(false, { responseMs: QUIZ_PER_QUESTION_MS })
  }, [submitAnswer])

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
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground text-xs font-[510]">
            {t('progress', { current: currentIndex + 1, total })}
          </span>
          <div className="flex items-center gap-3">
            <QuestionTimer
              key={`${currentIndex}-${currentExercise.vocab.id}`}
              durationMs={QUIZ_PER_QUESTION_MS}
              onExpire={handleTimeout}
            />
            <ExitConfirmDialog onConfirm={onExit} />
          </div>
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
