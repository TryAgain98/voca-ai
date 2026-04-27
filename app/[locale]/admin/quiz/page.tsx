'use client'

import { useRef, useState } from 'react'

import { MatchingGame } from '~/app/[locale]/admin/quiz/_components/matching-game'
import { MultipleChoiceQuiz } from '~/app/[locale]/admin/quiz/_components/multiple-choice-quiz'
import { QuizResults } from '~/app/[locale]/admin/quiz/_components/quiz-results'
import { QuizSetupScreen } from '~/app/[locale]/admin/quiz/_components/quiz-setup'
import { useQuiz } from '~/app/[locale]/admin/quiz/_hooks/use-quiz'

import type { MCResult } from '~/app/[locale]/admin/quiz/_types/quiz.types'

export default function QuizPage() {
  const { screen, setup, start, finish, reset } = useQuiz()
  const [mcResults, setMcResults] = useState<MCResult[]>([])
  const [matchScore, setMatchScore] = useState(0)
  const startTimeRef = useRef<number>(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const handleStart = (s: Parameters<typeof start>[0]) => {
    startTimeRef.current = Date.now()
    setMcResults([])
    setMatchScore(0)
    start(s)
  }

  const handleMCFinish = (results: MCResult[]) => {
    setMcResults(results)
    setElapsedSeconds(Math.round((Date.now() - startTimeRef.current) / 1000))
    finish()
  }

  const handleMatchFinish = (score: number) => {
    setMatchScore(score)
    setElapsedSeconds(Math.round((Date.now() - startTimeRef.current) / 1000))
    finish()
  }

  if (screen === 'setup' || !setup) {
    return <QuizSetupScreen onStart={handleStart} />
  }

  if (screen === 'playing') {
    if (setup.mode === 'multiple-choice') {
      return (
        <MultipleChoiceQuiz vocab={setup.vocab} onFinish={handleMCFinish} />
      )
    }
    return <MatchingGame vocab={setup.vocab} onFinish={handleMatchFinish} />
  }

  return (
    <QuizResults
      mode={setup.mode}
      mcResults={mcResults}
      matchScore={matchScore}
      elapsedSeconds={elapsedSeconds}
      onPlayAgain={() => handleStart(setup)}
      onChangeSetup={reset}
    />
  )
}
