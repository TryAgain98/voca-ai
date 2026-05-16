'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  playCorrectSound,
  playCountdownTick,
  playHintSound,
  playMilestoneSound,
  playNextQuestionSound,
  playSubmitSound,
  playWrongSound,
} from '~/lib/feedback-sound'
import { MCQExerciseCard } from '~admin/review/_components/exercises/mcq-exercise'
import { SpeechExerciseCard } from '~admin/review/_components/exercises/speech-exercise'
import { TypingExerciseCard } from '~admin/review/_components/exercises/typing-exercise'
import { ExitConfirmDialog } from '~admin/review/_components/exit-confirm-dialog'

import { useQuizSession } from '../_hooks/use-quiz-session'

import { QuestionTimer } from './question-timer'
import { QuizMascot } from './quiz-mascot'
import { QuizProgress } from './quiz-progress'
import { QuizResults } from './quiz-results'

import type { MascotMood, TimerUrgency } from './quiz-mascot'
import type { QuizSetup } from '../_types/quiz.types'
import type {
  AnswerHandler,
  AnswerMeta,
  Exercise,
} from '~admin/review/_types/review.types'

const QUIZ_PER_QUESTION_MS = 20000

function renderExercise(
  exercise: Exercise,
  index: number,
  onAnswer: AnswerHandler,
  onQuizSubmit: () => void,
  onQuizHint: () => void,
) {
  switch (exercise.type) {
    case 'word-to-meaning':
      return (
        <MCQExerciseCard
          key={index}
          exercise={exercise}
          onAnswer={onAnswer}
          mode="quiz"
          onQuizSubmit={onQuizSubmit}
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
          onQuizSubmit={onQuizSubmit}
          onQuizHint={onQuizHint}
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
  const [timerState, setTimerState] = useState<{
    index: number
    urgency: TimerUrgency
  }>({ index: 0, urgency: 'normal' })
  const [mascotMood, setMascotMood] = useState<MascotMood>('focus')

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

  const progressPercent = useMemo(
    () => (total > 0 ? (currentIndex / total) * 100 : 0),
    [currentIndex, total],
  )
  const timerUrgency =
    timerState.index === currentIndex ? timerState.urgency : 'normal'

  useEffect(() => {
    if (mascotMood === 'focus') return
    const id = setTimeout(() => setMascotMood('focus'), 900)
    return () => clearTimeout(id)
  }, [mascotMood])

  const handleAnswer = useCallback<AnswerHandler>(
    (isCorrect, meta?: AnswerMeta) => {
      if (meta?.usedHint && meta.answerCorrect && !isCorrect) {
        setMascotMood('hint')
      } else if (isCorrect) {
        setMascotMood('celebrate')
        playCorrectSound()
      } else {
        setMascotMood('stumble')
        playWrongSound()
      }
      submitAnswer(isCorrect, meta)
      if (currentIndex + 1 < total) playNextQuestionSound()
    },
    [currentIndex, submitAnswer, total],
  )

  const handleTimeout = useCallback(() => {
    setMascotMood('stumble')
    playWrongSound()
    submitAnswer(false, { responseMs: QUIZ_PER_QUESTION_MS })
    if (currentIndex + 1 < total) playNextQuestionSound()
  }, [currentIndex, submitAnswer, total])

  const handleQuizSubmit = useCallback(() => {
    playSubmitSound()
  }, [])

  const handleQuizHint = useCallback(() => {
    setMascotMood('hint')
    playHintSound()
  }, [])

  const handleCountdownTick = useCallback(
    (intensity: 'low' | 'medium' | 'high') => {
      playCountdownTick(intensity)
    },
    [],
  )

  const handleTimerUrgencyChange = useCallback(
    (urgency: TimerUrgency) => {
      setTimerState({ index: currentIndex, urgency })
    },
    [currentIndex],
  )

  const handleMilestone = useCallback(() => {
    setMascotMood('celebrate')
    playMilestoneSound()
  }, [])

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
        onViewHistory={onExit}
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
              onTick={handleCountdownTick}
              onUrgencyChange={handleTimerUrgencyChange}
            />
            <ExitConfirmDialog onConfirm={onExit} />
          </div>
        </div>
        <QuizProgress percent={progressPercent} onMilestone={handleMilestone} />
        <QuizMascot
          percent={progressPercent}
          urgency={timerUrgency}
          mood={mascotMood}
        />
      </div>

      {renderExercise(
        currentExercise,
        currentIndex,
        handleAnswer,
        handleQuizSubmit,
        handleQuizHint,
      )}
    </div>
  )
}
