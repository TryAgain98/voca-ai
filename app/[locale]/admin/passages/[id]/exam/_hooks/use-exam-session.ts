'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useAudioRecorder } from '~/hooks/use-audio-recorder'
import { useCreatePassageSession } from '~/hooks/use-passage-sessions'
import { calculatePassageExamScore } from '~/lib/passage-score'
import { scorePassageAudio } from '~/lib/passage-speech-scoring'

import type { WordResult } from '~/types'

export type ExamState = 'idle' | 'recording' | 'scoring' | 'done'
export type BenchmarkKey = 'good' | 'ok' | 'acceptable'

interface UseExamSessionReturn {
  state: ExamState
  wordResults: WordResult[] | null
  score: number
  pronunciationScore: number
  elapsed: number
  audioUrl: string | null
  isSaved: boolean
  selectedBenchmark: BenchmarkKey
  setSelectedBenchmark: (b: BenchmarkKey) => void
  startRecording: () => void
  stopAndScore: () => void
  reset: () => void
  saveResult: (passageId: string, userId: string) => void
}

export function useExamSession(
  passageContent: string,
  timeGood: number | null,
  timeOk: number | null,
  timeAcceptable: number | null,
): UseExamSessionReturn {
  const [state, setState] = useState<ExamState>('idle')
  const [wordResults, setWordResults] = useState<WordResult[] | null>(null)
  const [transcript, setTranscript] = useState('')
  const [score, setScore] = useState(0)
  const [pronunciationScore, setPronunciationScore] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkKey>('ok')

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)
  const audioRecorder = useAudioRecorder()
  const createSession = useCreatePassageSession()

  const getBenchmarkTime = useCallback(() => {
    if (selectedBenchmark === 'good') return timeGood
    if (selectedBenchmark === 'ok') return timeOk
    return timeAcceptable
  }, [selectedBenchmark, timeGood, timeOk, timeAcceptable])

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => () => clearTimer(), [clearTimer])

  async function startRecording() {
    try {
      audioRecorder.clearRecording()
      await audioRecorder.startRecording()
      startTimeRef.current = Date.now()
      setTranscript('')
      setElapsed(0)
      setState('recording')

      timerRef.current = setInterval(() => {
        setElapsed(Math.round((Date.now() - startTimeRef.current) / 1000))
      }, 500)
    } catch {
      toast.error('Không truy cập được microphone')
    }
  }

  async function stopAndScore() {
    const finalElapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
    clearTimer()
    setElapsed(finalElapsed)

    setState('scoring')

    const audioBlob = await audioRecorder.stopRecording()
    if (!audioBlob) {
      toast.error('Không có bản ghi âm để chấm')
      setState('idle')
      return
    }

    try {
      const result = await scorePassageAudio(audioBlob, passageContent)
      const examScore = calculatePassageExamScore(
        result.pronunciationScore,
        finalElapsed,
        getBenchmarkTime(),
      )

      setTranscript(result.transcript)
      setWordResults(result.wordResults)
      setPronunciationScore(result.pronunciationScore)
      setScore(examScore.overallScore)
      setState('done')
    } catch {
      toast.error('Chấm điểm thất bại, thử lại')
      setState('idle')
    }
  }

  function reset() {
    clearTimer()
    audioRecorder.clearRecording()
    setState('idle')
    setWordResults(null)
    setTranscript('')
    setScore(0)
    setPronunciationScore(0)
    setElapsed(0)
    setIsSaved(false)
  }

  function saveResult(passageId: string, userId: string) {
    if (!wordResults) return
    const examScore = calculatePassageExamScore(
      pronunciationScore,
      elapsed,
      getBenchmarkTime(),
    )

    createSession.mutate(
      {
        passage_id: passageId,
        user_id: userId,
        mode: 'exam',
        transcript,
        overall_score: examScore.overallScore,
        pronunciation_score: examScore.pronunciationScore,
        fluency_score: examScore.fluencyScore,
        word_results: wordResults,
        duration_seconds: elapsed,
      },
      { onSuccess: () => setIsSaved(true) },
    )
  }

  return {
    state,
    wordResults,
    score,
    pronunciationScore,
    elapsed,
    audioUrl: audioRecorder.audioUrl,
    isSaved,
    selectedBenchmark,
    setSelectedBenchmark,
    startRecording,
    stopAndScore,
    reset,
    saveResult,
  }
}
