'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useAudioRecorder } from '~/hooks/use-audio-recorder'
import { useCreatePassageSession } from '~/hooks/use-passage-sessions'
import { overallScore } from '~/lib/passage-score'
import { scorePassageAudio } from '~/lib/passage-speech-scoring'

import type { WordResult } from '~/types'

export type PracticeState = 'idle' | 'listening' | 'scoring' | 'scored'

interface UsePracticeSessionReturn {
  state: PracticeState
  wordResults: WordResult[] | null
  score: number
  transcript: string
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
  const [state, setState] = useState<PracticeState>('idle')
  const [transcript, setTranscript] = useState('')
  const [wordResults, setWordResults] = useState<WordResult[] | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  const audioRecorder = useAudioRecorder()
  const createSession = useCreatePassageSession()

  const score = useMemo(
    () => (wordResults ? overallScore(wordResults) : 0),
    [wordResults],
  )

  const isSupported =
    typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now()
    setElapsedSeconds(0)
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.round((Date.now() - startTimeRef.current) / 1000))
    }, 500)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  async function startListening() {
    try {
      setTranscript('')
      setWordResults(null)
      audioRecorder.clearRecording()
      await audioRecorder.startRecording()
      startTimer()
      setState('listening')
    } catch {
      stopTimer()
      setState('idle')
      toast.error('Không truy cập được microphone')
    }
  }

  async function stopListening() {
    stopTimer()
    setState('scoring')

    const audioBlob = await audioRecorder.stopRecording()
    if (!audioBlob) {
      toast.error('Không có bản ghi âm để chấm')
      setState('idle')
      return
    }

    try {
      const result = await scorePassageAudio(audioBlob, passageContent)

      setTranscript(result.transcript)
      setWordResults(result.wordResults)
      setState('scored')
    } catch {
      toast.error('Chấm điểm thất bại, thử lại')
      setState('idle')
    }
  }

  function reset() {
    stopTimer()
    setElapsedSeconds(0)
    audioRecorder.clearRecording()
    setTranscript('')
    setWordResults(null)
    setState('idle')
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
      transcript,
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
    transcript,
    elapsedSeconds,
    audioUrl: audioRecorder.audioUrl,
    showTranslation,
    isSupported,
    toggleTranslation,
    startListening,
    stopListening,
    reset,
    saveResult,
  }
}
