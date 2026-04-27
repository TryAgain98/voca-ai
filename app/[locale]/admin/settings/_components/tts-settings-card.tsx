'use client'

import { Loader2, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Slider } from '~/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { useTTS } from '~/hooks/use-tts'
import { useTTSSettingsStore } from '~/stores/tts-settings'

import type { OpenAIVoice, TTSEngine } from '~/stores/tts-settings'

const TEST_WORD = 'pronunciation'

const OPENAI_VOICES: {
  value: OpenAIVoice
  label: string
  description: string
}[] = [
  { value: 'alloy', label: 'Alloy', description: 'Neutral' },
  { value: 'echo', label: 'Echo', description: 'Male' },
  { value: 'fable', label: 'Fable', description: 'British' },
  { value: 'onyx', label: 'Onyx', description: 'Deep male' },
  { value: 'nova', label: 'Nova', description: 'Female' },
  { value: 'shimmer', label: 'Shimmer', description: 'Soft female' },
]

export function TtsSettingsCard() {
  const engine = useTTSSettingsStore((s) => s.engine)
  const webSpeechRate = useTTSSettingsStore((s) => s.webSpeechRate)
  const webSpeechPitch = useTTSSettingsStore((s) => s.webSpeechPitch)
  const webSpeechVoiceURI = useTTSSettingsStore((s) => s.webSpeechVoiceURI)
  const openaiVoice = useTTSSettingsStore((s) => s.openaiVoice)
  const openaiSpeed = useTTSSettingsStore((s) => s.openaiSpeed)
  const setEngine = useTTSSettingsStore((s) => s.setEngine)
  const setWebSpeechRate = useTTSSettingsStore((s) => s.setWebSpeechRate)
  const setWebSpeechPitch = useTTSSettingsStore((s) => s.setWebSpeechPitch)
  const setWebSpeechVoiceURI = useTTSSettingsStore(
    (s) => s.setWebSpeechVoiceURI,
  )
  const setOpenaiVoice = useTTSSettingsStore((s) => s.setOpenaiVoice)
  const setOpenaiSpeed = useTTSSettingsStore((s) => s.setOpenaiSpeed)

  const { speak, isSpeaking, isLoading } = useTTS(TEST_WORD)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const load = () => {
      const english = window.speechSynthesis
        .getVoices()
        .filter((v) => v.lang.startsWith('en'))
      setVoices(english)
    }
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () =>
      window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Text-to-Speech</CardTitle>
        <p className="text-muted-foreground text-sm">
          Configure how vocabulary words are pronounced
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs value={engine} onValueChange={(v) => setEngine(v as TTSEngine)}>
          <TabsList>
            <TabsTrigger value="web-speech">Web Speech (Browser)</TabsTrigger>
            <TabsTrigger value="openai">OpenAI TTS</TabsTrigger>
          </TabsList>

          <TabsContent value="web-speech" className="mt-5 space-y-5">
            <div className="space-y-2">
              <Label>Voice</Label>
              <Select
                value={webSpeechVoiceURI ?? ''}
                onValueChange={(v) => setWebSpeechVoiceURI(v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Default system voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name}
                      <span className="text-muted-foreground ml-1 text-xs">
                        ({voice.lang})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Speed</Label>
                <span className="text-muted-foreground text-xs">
                  {webSpeechRate.toFixed(1)}x
                </span>
              </div>
              <Slider
                min={0.5}
                max={2}
                step={0.1}
                value={[webSpeechRate]}
                onValueChange={(v) =>
                  setWebSpeechRate(Array.isArray(v) ? (v[0] ?? 1) : v)
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Pitch</Label>
                <span className="text-muted-foreground text-xs">
                  {webSpeechPitch.toFixed(1)}
                </span>
              </div>
              <Slider
                min={0.5}
                max={2}
                step={0.1}
                value={[webSpeechPitch]}
                onValueChange={(v) =>
                  setWebSpeechPitch(Array.isArray(v) ? (v[0] ?? 1) : v)
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="openai" className="mt-5 space-y-5">
            <div className="space-y-2">
              <Label>Voice</Label>
              <Select
                value={openaiVoice}
                onValueChange={(v) => setOpenaiVoice(v as OpenAIVoice)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPENAI_VOICES.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label}
                      <span className="text-muted-foreground ml-1 text-xs">
                        — {v.description}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Speed</Label>
                <span className="text-muted-foreground text-xs">
                  {openaiSpeed.toFixed(2)}x
                </span>
              </div>
              <Slider
                min={0.25}
                max={4}
                step={0.05}
                value={[openaiSpeed]}
                onValueChange={(v) =>
                  setOpenaiSpeed(Array.isArray(v) ? (v[0] ?? 1) : v)
                }
              />
            </div>

            <p className="text-muted-foreground text-xs">
              OpenAI TTS uses API credits and requires an internet connection.
              Higher quality than browser voices.
            </p>
          </TabsContent>
        </Tabs>

        <div className="border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={speak}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 size={14} className="mr-2 animate-spin" />
            ) : isSpeaking ? (
              <VolumeX size={14} className="mr-2" />
            ) : (
              <Volume2 size={14} className="mr-2" />
            )}
            {isLoading
              ? 'Loading...'
              : isSpeaking
                ? 'Stop'
                : 'Test pronunciation'}
          </Button>
          <p className="text-muted-foreground mt-2 text-xs">
            Plays the word &quot;{TEST_WORD}&quot;
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
