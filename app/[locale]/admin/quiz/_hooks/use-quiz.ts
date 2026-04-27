import { useState } from 'react'

import type {
  QuizScreen,
  QuizSetup,
} from '~/app/[locale]/admin/quiz/_types/quiz.types'

interface UseQuizReturn {
  screen: QuizScreen
  setup: QuizSetup | null
  start: (s: QuizSetup) => void
  finish: () => void
  reset: () => void
}

export function useQuiz(): UseQuizReturn {
  const [screen, setScreen] = useState<QuizScreen>('setup')
  const [setup, setSetup] = useState<QuizSetup | null>(null)

  const start = (s: QuizSetup) => {
    setSetup(s)
    setScreen('playing')
  }

  const finish = () => setScreen('results')

  const reset = () => {
    setScreen('setup')
  }

  return { screen, setup, start, finish, reset }
}
