'use client'

import { useCallback, useRef, useState } from 'react'

export type SpeechScoreStatus =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'done'
  | 'error'

interface UseSpeechScoreReturn {
  status: SpeechScoreStatus
  transcript: string
  score: number
  start: () => Promise<void>
  reset: () => void
  isSupported: boolean
}

const RECORDING_DURATION_MS = 4000

function isMediaRecorderSupported(): boolean {
  if (typeof window === 'undefined') return false
  return !!(navigator.mediaDevices && window.MediaRecorder)
}

export function useSpeechScore(expected: string): UseSpeechScoreReturn {
  const [status, setStatus] = useState<SpeechScoreStatus>('idle')
  const [transcript, setTranscript] = useState('')
  const [score, setScore] = useState(0)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const start = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current)

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setStatus('error')
      return
    }

    streamRef.current = stream
    const recorder = new MediaRecorder(stream)
    recorderRef.current = recorder
    const chunks: Blob[] = []

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }

    recorder.onstop = async () => {
      stopStream()
      setStatus('processing')
      try {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append(
          'audio',
          new File([blob], 'audio.webm', { type: 'audio/webm' }),
        )
        formData.append('expected', expected)

        const res = await fetch('/api/speech-score', {
          method: 'POST',
          body: formData,
        })
        const data = (await res.json()) as {
          transcript?: string
          score?: number
        }
        setTranscript(data.transcript ?? '')
        setScore(data.score ?? 0)
        setStatus('done')
      } catch {
        setStatus('error')
      }
    }

    recorder.start()
    setStatus('listening')

    timerRef.current = setTimeout(() => {
      if (recorder.state === 'recording') recorder.stop()
    }, RECORDING_DURATION_MS)
  }, [expected, stopStream])

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
    recorderRef.current = null
    stopStream()
    setStatus('idle')
    setTranscript('')
    setScore(0)
  }, [stopStream])

  return {
    status,
    transcript,
    score,
    start,
    reset,
    isSupported: isMediaRecorderSupported(),
  }
}
