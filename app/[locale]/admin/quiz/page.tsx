'use client'

import { useState } from 'react'

import { QuizSessionView } from './_components/quiz-session'
import { QuizSetup } from './_components/quiz-setup'

import type { QuizSetup as QuizSetupType } from './_types/quiz.types'

export default function QuizPage() {
  const [setup, setSetup] = useState<QuizSetupType | null>(null)
  const [sessionKey, setSessionKey] = useState(0)

  if (!setup) {
    return <QuizSetup onStart={setSetup} />
  }

  return (
    <QuizSessionView
      key={sessionKey}
      setup={setup}
      onExit={() => {
        setSetup(null)
        setSessionKey((k) => k + 1)
      }}
    />
  )
}
