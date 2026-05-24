'use client'

import { useMemo, useState } from 'react'

import { useCreatePassageSession } from '~/hooks/use-passage-sessions'
import { useSpeechRecognition } from '~/hooks/use-speech-recognition'
import { overallScore, scorePassage } from '~/lib/passage-score'

import type { WordResult } from '~/types'

export type PracticeState = 'idle' | 'listening' | 'scored'

interface UsePracticeSessionReturn {
  state: PracticeState
  wordResults: WordResult[] | null
  score: number
  showTranslation: boolean
  isSupported: boolean
  toggleTranslation: () => void
  startListening: () => void
  reset: () => void
  saveResult: (
    passageId: string,
    userId: string,
    durationSeconds: number,
  ) => void
}

export function usePracticeSession(
  passageContent: string,
): UsePracticeSessionReturn {
  const [showTranslation, setShowTranslation] = useState(false)

  const speech = useSpeechRecognition()
  const createSession = useCreatePassageSession()

  const wordResults = useMemo(() => {
    if (speech.status !== 'done' || !speech.transcript) return null
    return scorePassage(speech.transcript, passageContent)
  }, [speech.status, speech.transcript, passageContent])

  const score = useMemo(
    () => (wordResults ? overallScore(wordResults) : 0),
    [wordResults],
  )

  const state: PracticeState = wordResults
    ? 'scored'
    : speech.status === 'listening'
      ? 'listening'
      : 'idle'

  function startListening() {
    speech.start()
  }

  function reset() {
    speech.reset()
  }

  function toggleTranslation() {
    setShowTranslation((prev) => !prev)
  }

  function saveResult(
    passageId: string,
    userId: string,
    durationSeconds: number,
  ) {
    if (!wordResults) return
    createSession.mutate({
      passage_id: passageId,
      user_id: userId,
      mode: 'practice',
      transcript: speech.transcript,
      overall_score: score,
      pronunciation_score: score,
      fluency_score: null,
      word_results: wordResults,
      duration_seconds: durationSeconds,
    })
  }

  return {
    state,
    wordResults,
    score,
    showTranslation,
    isSupported: speech.isSupported,
    toggleTranslation,
    startListening,
    reset,
    saveResult,
  }
}
