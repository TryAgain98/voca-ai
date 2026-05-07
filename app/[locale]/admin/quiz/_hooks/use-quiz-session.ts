import { useCallback, useState } from 'react'

import type { QuizExerciseResult, QuizSetup } from '../_types/quiz.types'
import type {
  AnswerMeta,
  Exercise,
  ExerciseType,
  ReviewVocab,
} from '~admin/review/_types/review.types'

function pickDistractors(vocab: ReviewVocab, pool: ReviewVocab[]): string[] {
  const sameType = pool.filter(
    (v) => v.id !== vocab.id && v.word_type === vocab.word_type,
  )
  const others = pool.filter(
    (v) => v.id !== vocab.id && v.word_type !== vocab.word_type,
  )
  return [...sameType, ...others]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((v) => v.meaning)
}

function makeExercise(
  vocab: ReviewVocab,
  type: ExerciseType,
  pool: ReviewVocab[],
): Exercise {
  if (type === 'word-to-meaning') {
    const distractors = pickDistractors(vocab, pool)
    const options = [...distractors, vocab.meaning].sort(
      () => Math.random() - 0.5,
    )
    return {
      type,
      vocab,
      options,
      correctIndex: options.indexOf(vocab.meaning),
      isReinforcement: false,
    }
  }
  return { type, vocab, isReinforcement: false }
}

function buildQueue(vocab: ReviewVocab[], types: ExerciseType[]): Exercise[] {
  return [...vocab].map((v) => {
    const type = types[Math.floor(Math.random() * types.length)]
    return makeExercise(v, type, vocab)
  })
}

interface UseQuizSessionReturn {
  currentExercise: Exercise | null
  currentIndex: number
  total: number
  results: QuizExerciseResult[]
  isComplete: boolean
  startTime: Date
  endTime: Date | null
  submitAnswer: (isCorrect: boolean, meta?: AnswerMeta) => void
}

export function useQuizSession(setup: QuizSetup): UseQuizSessionReturn {
  const [queue] = useState<Exercise[]>(() =>
    buildQueue(setup.vocab, setup.exerciseTypes),
  )
  const [startTime] = useState<Date>(() => new Date())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<QuizExerciseResult[]>([])
  const [endTime, setEndTime] = useState<Date | null>(null)

  const isComplete = currentIndex >= queue.length
  const currentExercise = queue[currentIndex] ?? null

  const submitAnswer = useCallback(
    (isCorrect: boolean, meta?: AnswerMeta) => {
      if (!currentExercise) return
      setResults((prev) => [
        ...prev,
        {
          exercise: currentExercise,
          isCorrect,
          userAnswer: meta?.userAnswer,
          responseMs: meta?.responseMs,
        },
      ])
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      if (nextIndex >= queue.length) {
        setEndTime(new Date())
      }
    },
    [currentExercise, currentIndex, queue.length],
  )

  return {
    currentExercise,
    currentIndex,
    total: queue.length,
    results,
    isComplete,
    startTime,
    endTime,
    submitAnswer,
  }
}
