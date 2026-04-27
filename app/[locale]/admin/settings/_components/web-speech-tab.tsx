'use client'

import { useTranslations } from 'next-intl'

import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Slider } from '~/components/ui/slider'
import { useTTSSettingsStore } from '~/stores/tts-settings'

interface WebSpeechTabProps {
  voices: SpeechSynthesisVoice[]
}

export function WebSpeechTab({ voices }: WebSpeechTabProps) {
  const t = useTranslations('Settings')
  const webSpeechRate = useTTSSettingsStore((s) => s.webSpeechRate)
  const webSpeechPitch = useTTSSettingsStore((s) => s.webSpeechPitch)
  const webSpeechVoiceURI = useTTSSettingsStore((s) => s.webSpeechVoiceURI)
  const setWebSpeechRate = useTTSSettingsStore((s) => s.setWebSpeechRate)
  const setWebSpeechPitch = useTTSSettingsStore((s) => s.setWebSpeechPitch)
  const setWebSpeechVoiceURI = useTTSSettingsStore(
    (s) => s.setWebSpeechVoiceURI,
  )

  return (
    <div className="mt-5 space-y-5">
      <div className="space-y-2">
        <Label>{t('voiceLabel')}</Label>
        <Select
          value={webSpeechVoiceURI ?? ''}
          onValueChange={(v) => setWebSpeechVoiceURI(v || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('defaultVoice')} />
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
          <Label>{t('speedLabel')}</Label>
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
          <Label>{t('pitchLabel')}</Label>
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
    </div>
  )
}
