import { useCallback, useState } from 'react'

import { findSiblings } from '~/lib/answer-pattern'

import type {
  AnswerMeta,
  Exercise,
  ExerciseResult,
  ExerciseType,
  ReviewSetup,
  ReviewVocab,
} from '../_types/review.types'

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
  isReinforcement = false,
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
      isReinforcement,
    }
  }
  if (type === 'speak-word') {
    return { type, vocab, isReinforcement }
  }
  const siblings = type === 'meaning-to-word' ? findSiblings(vocab, pool) : []
  return { type, vocab, siblings, isReinforcement }
}

function buildInitialQueue(
  vocab: ReviewVocab[],
  types: ExerciseType[],
): Exercise[] {
  const selected = [...vocab]
  return selected.map((v) => {
    const type = types[Math.floor(Math.random() * types.length)]
    return makeExercise(v, type, vocab)
  })
}

interface UseReviewSessionReturn {
  currentExercise: Exercise | null
  currentIndex: number
  totalQueued: number
  results: ExerciseResult[]
  isComplete: boolean
  submitAnswer: (isCorrect: boolean, meta?: AnswerMeta) => void
}

export function useReviewSession(setup: ReviewSetup): UseReviewSessionReturn {
  const [queue, setQueue] = useState<Exercise[]>(() =>
    buildInitialQueue(setup.vocab, setup.exerciseTypes),
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<ExerciseResult[]>([])

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
          responseMs: meta?.responseMs,
          usedHint: meta?.usedHint,
        },
      ])
      if (!isCorrect) {
        const reinforcement = makeExercise(
          currentExercise.vocab,
          currentExercise.type,
          setup.vocab,
          true,
        )
        setQueue((prev) => [...prev, reinforcement])
      }
      setCurrentIndex((i) => i + 1)
    },
    [currentExercise, setup.vocab],
  )

  return {
    currentExercise,
    currentIndex,
    totalQueued: queue.length,
    results,
    isComplete,
    submitAnswer,
  }
}
