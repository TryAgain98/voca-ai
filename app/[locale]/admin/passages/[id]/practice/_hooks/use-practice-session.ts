'use client'

import { useCallback, useMemo, useRef, useState } from 'react'

import { useAudioRecorder } from '~/hooks/use-audio-recorder'
import { useCreatePassageSession } from '~/hooks/use-passage-sessions'
import { useSpeechRecognition } from '~/hooks/use-speech-recognition'
import { overallScore, scorePassage } from '~/lib/passage-score'

import type { WordResult } from '~/types'

export type PracticeState = 'idle' | 'listening' | 'scored'

interface UsePracticeSessionReturn {
  state: PracticeState
  wordResults: WordResult[] | null
  score: number
  elapsedSeconds: number
  audioUrl: string | null
  showTranslation: boolean
  isSupported: boolean
  toggleTranslation: () => void
  startListening: () => void
  stopListening: () => void
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
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const speech = useSpeechRecognition({ continuous: true })
  const audioRecorder = useAudioRecorder()
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

  const startTimer = useCallback(() => {
    setElapsedSeconds(0)
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  async function startListening() {
    startTimer()
    await audioRecorder.startRecording()
    speech.start()
  }

  function stopListening() {
    stopTimer()
    audioRecorder.stopRecording()
    speech.stop()
  }

  function reset() {
    stopTimer()
    setElapsedSeconds(0)
    audioRecorder.clearRecording()
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
    elapsedSeconds,
    audioUrl: audioRecorder.audioUrl,
    showTranslation,
    isSupported: speech.isSupported,
    toggleTranslation,
    startListening,
    stopListening,
    reset,
    saveResult,
  }
}
