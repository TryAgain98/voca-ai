import { useCallback, useRef, useState } from 'react'

export type SpeechStatus = 'idle' | 'listening' | 'done' | 'error'

interface SpeechRecognitionEvent extends Event {
  results: { [index: number]: { [index: number]: { transcript: string } } }
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start(): void
  abort(): void
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const win = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null
}

interface UseSpeechRecognitionReturn {
  status: SpeechStatus
  transcript: string
  start: () => void
  reset: () => void
  isSupported: boolean
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [status, setStatus] = useState<SpeechStatus>('idle')
  const [transcript, setTranscript] = useState('')
  const instanceRef = useRef<SpeechRecognitionInstance | null>(null)

  const isSupported = getCtor() !== null

  const start = useCallback(() => {
    const Ctor = getCtor()
    if (!Ctor) return

    instanceRef.current?.abort()

    const recognition = new Ctor()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    instanceRef.current = recognition

    recognition.onstart = () => setStatus('listening')
    recognition.onresult = (event) => {
      const result =
        event.results[0]?.[0]?.transcript.trim().toLowerCase() ?? ''
      setTranscript(result)
      setStatus('done')
    }
    recognition.onerror = () => setStatus('error')
    recognition.onend = () => {
      setStatus((prev) => (prev === 'listening' ? 'error' : prev))
    }

    recognition.start()
  }, [])

  const reset = useCallback(() => {
    instanceRef.current?.abort()
    instanceRef.current = null
    setStatus('idle')
    setTranscript('')
  }, [])

  return { status, transcript, start, reset, isSupported }
}
