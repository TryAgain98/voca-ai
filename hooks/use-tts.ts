import { useCallback, useEffect } from 'react'

import { useTTSSettingsStore } from '~/stores/tts-settings'

let currentAudio: HTMLAudioElement | null = null

// Deduplicates in-flight prefetch requests for the same URL
const pendingPrefetches = new Set<string>()

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

function buildTTSUrl(text: string, voice: string, speed: number): string {
  const params = new URLSearchParams({ text, voice, speed: String(speed) })
  return `/api/tts?${params.toString()}`
}

// Warms the HTTP disk cache — browser stores response on disk, not in RAM
function prefetchTTSUrl(text: string, voice: string, speed: number): void {
  const url = buildTTSUrl(text, voice, speed)
  if (pendingPrefetches.has(url)) return
  pendingPrefetches.add(url)
  void fetch(url).finally(() => pendingPrefetches.delete(url))
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
      prefetchTTSUrl(text, openaiVoice, openaiSpeed)
    }
  }, [engine, prefetch, text, openaiVoice, openaiSpeed])

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause()
        currentAudio = null
      }
      if (typeof window !== 'undefined') {
        window.speechSynthesis?.cancel()
      }
      setSpeakingText(null)
      setLoadingText(null)
    }
  }, [setSpeakingText, setLoadingText])

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

  const speakOpenAI = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
    }
    setSpeakingText(null)
    setLoadingText(text)

    const url = buildTTSUrl(text, openaiVoice, openaiSpeed)
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
    }

    audio.play().catch(() => {
      setLoadingText(null)
      setSpeakingText(null)
      currentAudio = null
    })
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
      speakOpenAI()
    }
  }, [engine, isSpeaking, isLoading, stopAll, speakWebSpeech, speakOpenAI])

  return { speak, stop: stopAll, isSpeaking, isLoading }
}
