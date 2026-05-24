'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useCreatePassageSession } from '~/hooks/use-passage-sessions'
import { overallScore, scorePassage } from '~/lib/passage-score'

import type { WordResult } from '~/types'

export type ExamState = 'idle' | 'recording' | 'scoring' | 'done'
export type BenchmarkKey = 'good' | 'ok' | 'acceptable'

interface UseExamSessionReturn {
  state: ExamState
  wordResults: WordResult[] | null
  score: number
  elapsed: number
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
  const [score, setScore] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkKey>('ok')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)
  const createSession = useCreatePassageSession()

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => () => clearTimer(), [clearTimer])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorderRef.current = recorder
      startTimeRef.current = Date.now()
      recorder.start(100)
      setState('recording')

      timerRef.current = setInterval(() => {
        setElapsed(Math.round((Date.now() - startTimeRef.current) / 1000))
      }, 500)
    } catch {
      toast.error('Không truy cập được microphone')
    }
  }

  async function stopAndScore() {
    clearTimer()
    const recorder = mediaRecorderRef.current
    if (!recorder) return

    setState('scoring')

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve()
      recorder.stop()
      recorder.stream.getTracks().forEach((t) => t.stop())
    })

    try {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
      const form = new FormData()
      form.append('audio', audioBlob, 'recording.webm')
      form.append('expected', passageContent)

      const res = await fetch('/api/speech-score', {
        method: 'POST',
        body: form,
      })
      if (!res.ok) throw new Error('Scoring failed')

      const { transcript } = (await res.json()) as {
        transcript: string
        score: number
      }
      const results = scorePassage(transcript, passageContent)
      const overall = overallScore(results)

      setWordResults(results)
      setScore(overall)
      setState('done')
    } catch {
      toast.error('Chấm điểm thất bại, thử lại')
      setState('idle')
    }
  }

  function reset() {
    clearTimer()
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop())
    mediaRecorderRef.current = null
    chunksRef.current = []
    setState('idle')
    setWordResults(null)
    setScore(0)
    setElapsed(0)
  }

  function saveResult(passageId: string, userId: string) {
    if (!wordResults) return
    const benchmarkTime =
      selectedBenchmark === 'good'
        ? timeGood
        : selectedBenchmark === 'ok'
          ? timeOk
          : timeAcceptable

    const fluency =
      benchmarkTime && elapsed > 0
        ? Math.max(
            0,
            Math.min(100, Math.round((benchmarkTime / elapsed) * 100)),
          )
        : null

    createSession.mutate({
      passage_id: passageId,
      user_id: userId,
      mode: 'exam',
      transcript: null,
      overall_score: Math.round((score + (fluency ?? score)) / 2),
      pronunciation_score: score,
      fluency_score: fluency,
      word_results: wordResults,
      duration_seconds: elapsed,
    })
  }

  return {
    state,
    wordResults,
    score,
    elapsed,
    selectedBenchmark,
    setSelectedBenchmark,
    startRecording,
    stopAndScore,
    reset,
    saveResult,
  }
}
