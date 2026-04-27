import { useCallback } from 'react'

import { useTTSSettingsStore } from '~/stores/tts-settings'

// Module-level ref so only one audio plays at a time across all SpeakButtons
let currentAudio: HTMLAudioElement | null = null

interface UseTTSReturn {
  speak: () => void
  stop: () => void
  isSpeaking: boolean
  isLoading: boolean
}

export function useTTS(text: string): UseTTSReturn {
  const engine = useTTSSettingsStore((s) => s.engine)
  const webSpeechRate = useTTSSettingsStore((s) => s.webSpeechRate)
  const webSpeechPitch = useTTSSettingsStore((s) => s.webSpeechPitch)
  const webSpeechVoiceURI = useTTSSettingsStore((s) => s.webSpeechVoiceURI)
  const openaiVoice = useTTSSettingsStore((s) => s.openaiVoice)
  const openaiSpeed = useTTSSettingsStore((s) => s.openaiSpeed)
  // Computed selectors — only re-render when THIS text's state changes
  const isSpeaking = useTTSSettingsStore((s) => s.speakingText === text)
  const isLoading = useTTSSettingsStore((s) => s.loadingText === text)
  const setSpeakingText = useTTSSettingsStore((s) => s.setSpeakingText)
  const setLoadingText = useTTSSettingsStore((s) => s.setLoadingText)

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
    setLoadingText(text)

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: openaiVoice, speed: openaiSpeed }),
      })
      if (!res.ok) throw new Error('TTS request failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      currentAudio = audio

      audio.onplay = () => {
        setLoadingText(null)
        setSpeakingText(text)
      }
      audio.onended = () => {
        setSpeakingText(null)
        URL.revokeObjectURL(url)
        currentAudio = null
      }
      audio.onerror = () => {
        setLoadingText(null)
        setSpeakingText(null)
        URL.revokeObjectURL(url)
        currentAudio = null
      }

      await audio.play()
    } catch {
      setLoadingText(null)
      setSpeakingText(null)
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
