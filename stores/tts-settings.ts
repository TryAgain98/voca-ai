import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export type TTSEngine = 'web-speech' | 'openai'
export type OpenAIVoice =
  | 'alloy'
  | 'echo'
  | 'fable'
  | 'onyx'
  | 'nova'
  | 'shimmer'

interface TTSSettingsState {
  // Persisted settings
  engine: TTSEngine
  webSpeechRate: number
  webSpeechPitch: number
  webSpeechVoiceURI: string | null
  openaiVoice: OpenAIVoice
  openaiSpeed: number
  // Runtime state (not persisted)
  speakingText: string | null
  loadingText: string | null
  // Actions
  setEngine: (engine: TTSEngine) => void
  setWebSpeechRate: (rate: number) => void
  setWebSpeechPitch: (pitch: number) => void
  setWebSpeechVoiceURI: (uri: string | null) => void
  setOpenaiVoice: (voice: OpenAIVoice) => void
  setOpenaiSpeed: (speed: number) => void
  setSpeakingText: (text: string | null) => void
  setLoadingText: (text: string | null) => void
}

export const useTTSSettingsStore = create<TTSSettingsState>()(
  devtools(
    persist(
      (set) => ({
        engine: 'web-speech',
        webSpeechRate: 1,
        webSpeechPitch: 1,
        webSpeechVoiceURI: null,
        openaiVoice: 'nova',
        openaiSpeed: 1.0,
        speakingText: null,
        loadingText: null,
        setEngine: (engine) => set({ engine }, false, 'setEngine'),
        setWebSpeechRate: (webSpeechRate) =>
          set({ webSpeechRate }, false, 'setWebSpeechRate'),
        setWebSpeechPitch: (webSpeechPitch) =>
          set({ webSpeechPitch }, false, 'setWebSpeechPitch'),
        setWebSpeechVoiceURI: (webSpeechVoiceURI) =>
          set({ webSpeechVoiceURI }, false, 'setWebSpeechVoiceURI'),
        setOpenaiVoice: (openaiVoice) =>
          set({ openaiVoice }, false, 'setOpenaiVoice'),
        setOpenaiSpeed: (openaiSpeed) =>
          set({ openaiSpeed }, false, 'setOpenaiSpeed'),
        setSpeakingText: (speakingText) =>
          set({ speakingText }, false, 'setSpeakingText'),
        setLoadingText: (loadingText) =>
          set({ loadingText }, false, 'setLoadingText'),
      }),
      {
        name: 'tts-settings',
        partialize: (state) => ({
          engine: state.engine,
          webSpeechRate: state.webSpeechRate,
          webSpeechPitch: state.webSpeechPitch,
          webSpeechVoiceURI: state.webSpeechVoiceURI,
          openaiVoice: state.openaiVoice,
          openaiSpeed: state.openaiSpeed,
        }),
      },
    ),
    { name: 'tts-settings-store' },
  ),
)
