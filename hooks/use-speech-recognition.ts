import { useCallback, useRef, useState } from 'react'

export type SpeechStatus = 'idle' | 'listening' | 'done' | 'error'

interface SpeechRecognitionEvent extends Event {
  results: {
    length: number
    [index: number]: {
      length: number
      isFinal?: boolean
      [index: number]: { transcript: string }
    }
  }
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
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

interface UseSpeechRecognitionOptions {
  continuous?: boolean
}

interface UseSpeechRecognitionReturn {
  status: SpeechStatus
  transcript: string
  alternatives: string[]
  start: () => void
  stop: () => void
  reset: () => void
  isSupported: boolean
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
): UseSpeechRecognitionReturn {
  const { continuous = false } = options
  const [status, setStatus] = useState<SpeechStatus>('idle')
  const [transcript, setTranscript] = useState('')
  const [alternatives, setAlternatives] = useState<string[]>([])
  const instanceRef = useRef<SpeechRecognitionInstance | null>(null)

  const isSupported = getCtor() !== null

  const start = useCallback(() => {
    const Ctor = getCtor()
    if (!Ctor) return

    instanceRef.current?.abort()

    const recognition = new Ctor()
    recognition.lang = 'en-US'
    recognition.continuous = continuous
    recognition.interimResults = false
    recognition.maxAlternatives = continuous ? 1 : 5
    instanceRef.current = recognition

    recognition.onstart = () => setStatus('listening')

    recognition.onresult = (event) => {
      if (continuous) {
        let text = ''
        for (let i = 0; i < event.results.length; i++) {
          const r = event.results[i]
          if (r?.isFinal !== false) text += (r?.[0]?.transcript ?? '') + ' '
        }
        setTranscript(text.trim())
      } else {
        const result = event.results[0]
        const matches = Array.from(
          { length: result?.length ?? 0 },
          (_, index) => result[index]?.transcript.trim().toLowerCase(),
        ).filter((value): value is string => !!value)
        setAlternatives(matches)
        setTranscript(matches[0] ?? '')
        setStatus('done')
      }
    }

    recognition.onerror = () => setStatus('error')
    recognition.onend = () => {
      setStatus((prev) =>
        prev === 'listening' ? (continuous ? 'done' : 'error') : prev,
      )
    }

    recognition.start()
  }, [continuous])

  const stop = useCallback(() => {
    instanceRef.current?.stop()
  }, [])

  const reset = useCallback(() => {
    instanceRef.current?.abort()
    instanceRef.current = null
    setStatus('idle')
    setTranscript('')
    setAlternatives([])
  }, [])

  return { status, transcript, alternatives, start, stop, reset, isSupported }
}
