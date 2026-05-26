import { useCallback, useEffect } from 'react'

import { useTTSSettingsStore } from '~/stores/tts-settings'

let currentAudio: HTMLAudioElement | null = null

// Blob URL cache keyed by text — survives re-renders, cleared on page reload
const audioCache = new Map<string, string>()
// In-flight fetch deduplication — prevents parallel requests for the same text
const pendingFetches = new Map<string, Promise<string | null>>()

// Concurrency limiter — max 3 simultaneous TTS requests to avoid flooding Edge TTS
const MAX_CONCURRENT = 3
let activeCount = 0
const waitQueue: Array<() => void> = []

function acquireSlot(): Promise<void> {
  if (activeCount < MAX_CONCURRENT) {
    activeCount++
    return Promise.resolve()
  }
  return new Promise((resolve) => waitQueue.push(resolve))
}

function releaseSlot(): void {
  const next = waitQueue.shift()
  if (next) {
    next()
  } else {
    activeCount--
  }
}

let speechPrewarmed = false
function prewarmSpeechEngine(): void {
  if (
    speechPrewarmed ||
    typeof window === 'undefined' ||
    !('speechSynthesis' in window)
  )
    return
  speechPrewarmed = true
  const warmup = new SpeechSynthesisUtterance(' ')
  warmup.volume = 0
  warmup.rate = 10
  window.speechSynthesis.speak(warmup)
  setTimeout(() => window.speechSynthesis.cancel(), 200)
}

async function fetchAudioUrl(
  text: string,
  voice: string,
  speed: number,
): Promise<string | null> {
  if (audioCache.has(text)) return audioCache.get(text)!
  if (pendingFetches.has(text)) return pendingFetches.get(text)!

  const promise = (async () => {
    await acquireSlot()
    try {
      const params = new URLSearchParams({ text, voice, speed: String(speed) })
      const res = await fetch(`/api/tts?${params.toString()}`)
      if (!res.ok) return null
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      audioCache.set(text, url)
      return url
    } catch {
      return null
    } finally {
      releaseSlot()
      pendingFetches.delete(text)
    }
  })()

  pendingFetches.set(text, promise)
  return promise
}

interface UseTTSOptions {
  prefetch?: boolean
}

interface UseTTSReturn {
  speak: () => void
  stop: () => void
  isSpeaking: boolean
  isLoading: boolean
}

export function useTTS(
  text: string,
  { prefetch = false }: UseTTSOptions = {},
): UseTTSReturn {
  const engine = useTTSSettingsStore((s) => s.engine)
  const webSpeechRate = useTTSSettingsStore((s) => s.webSpeechRate)
  const webSpeechPitch = useTTSSettingsStore((s) => s.webSpeechPitch)
  const webSpeechVoiceURI = useTTSSettingsStore((s) => s.webSpeechVoiceURI)
  const openaiVoice = useTTSSettingsStore((s) => s.openaiVoice)
  const openaiSpeed = useTTSSettingsStore((s) => s.openaiSpeed)
  const isSpeaking = useTTSSettingsStore((s) => s.speakingText === text)
  const isLoading = useTTSSettingsStore((s) => s.loadingText === text)
  const setSpeakingText = useTTSSettingsStore((s) => s.setSpeakingText)
  const setLoadingText = useTTSSettingsStore((s) => s.setLoadingText)

  useEffect(() => {
    if (engine === 'web-speech') {
      prewarmSpeechEngine()
    } else if (prefetch) {
      void fetchAudioUrl(text, openaiVoice, openaiSpeed)
    }
  }, [engine, prefetch, text, openaiVoice, openaiSpeed])

  const stopAll = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis?.cancel()
    }
    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
    }
    setSpeakingText(null)
    setLoadingText(null)
  }, [setSpeakingText, setLoadingText])

  const speakWebSpeech = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = webSpeechRate
    utterance.pitch = webSpeechPitch

    if (webSpeechVoiceURI) {
      const voice = window.speechSynthesis
        .getVoices()
        .find((v) => v.voiceURI === webSpeechVoiceURI)
      if (voice) utterance.voice = voice
    }

    utterance.onstart = () => setSpeakingText(text)
    utterance.onend = () => setSpeakingText(null)
    utterance.onerror = () => setSpeakingText(null)

    window.speechSynthesis.speak(utterance)
  }, [text, webSpeechRate, webSpeechPitch, webSpeechVoiceURI, setSpeakingText])

  const speakOpenAI = useCallback(async () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
    }
    setSpeakingText(null)
    if (!audioCache.has(text)) setLoadingText(text)

    const url = await fetchAudioUrl(text, openaiVoice, openaiSpeed)
    if (!url) {
      setLoadingText(null)
      setSpeakingText(null)
      return
    }

    const audio = new Audio(url)
    currentAudio = audio

    audio.onplay = () => {
      setLoadingText(null)
      setSpeakingText(text)
    }
    audio.onended = () => {
      setSpeakingText(null)
      currentAudio = null
    }
    audio.onerror = () => {
      setLoadingText(null)
      setSpeakingText(null)
      currentAudio = null
      audioCache.delete(text)
    }

    try {
      await audio.play()
    } catch {
      setLoadingText(null)
      setSpeakingText(null)
      currentAudio = null
    }
  }, [text, openaiVoice, openaiSpeed, setSpeakingText, setLoadingText])

  const speak = useCallback(() => {
    if (isSpeaking || isLoading) {
      stopAll()
      return
    }
    stopAll()
    if (engine === 'web-speech') {
      speakWebSpeech()
    } else {
      void speakOpenAI()
    }
  }, [engine, isSpeaking, isLoading, stopAll, speakWebSpeech, speakOpenAI])

  return { speak, stop: stopAll, isSpeaking, isLoading }
}
