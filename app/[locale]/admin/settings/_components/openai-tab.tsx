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

import type { OpenAIVoice } from '~/stores/tts-settings'

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

export function OpenAITab() {
  const t = useTranslations('Settings')
  const openaiVoice = useTTSSettingsStore((s) => s.openaiVoice)
  const openaiSpeed = useTTSSettingsStore((s) => s.openaiSpeed)
  const setOpenaiVoice = useTTSSettingsStore((s) => s.setOpenaiVoice)
  const setOpenaiSpeed = useTTSSettingsStore((s) => s.setOpenaiSpeed)

  return (
    <div className="mt-5 space-y-5">
      <div className="space-y-2">
        <Label>{t('voiceLabel')}</Label>
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
          <Label>{t('speedLabel')}</Label>
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

      <p className="text-muted-foreground text-xs">{t('openaiNote')}</p>
    </div>
  )
}
