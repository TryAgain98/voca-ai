'use client'

import { Loader2, Volume2, VolumeX } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { useTTS } from '~/hooks/use-tts'
import { useTTSSettingsStore } from '~/stores/tts-settings'

import { OpenAITab } from './openai-tab'
import { WebSpeechTab } from './web-speech-tab'

import type { TTSEngine } from '~/stores/tts-settings'

const TEST_WORD = 'pronunciation'

export function TtsSettingsCard() {
  const t = useTranslations('Settings')
  const tCommon = useTranslations('Common')
  const engine = useTTSSettingsStore((s) => s.engine)
  const setEngine = useTTSSettingsStore((s) => s.setEngine)
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
        <CardTitle className="text-sm font-semibold">{t('ttsTitle')}</CardTitle>
        <p className="text-muted-foreground text-sm">{t('ttsDescription')}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs value={engine} onValueChange={(v) => setEngine(v as TTSEngine)}>
          <TabsList>
            <TabsTrigger value="web-speech">{t('webSpeechTab')}</TabsTrigger>
            <TabsTrigger value="openai">{t('openaiTab')}</TabsTrigger>
          </TabsList>

          <TabsContent value="web-speech">
            <WebSpeechTab voices={voices} />
          </TabsContent>

          <TabsContent value="openai">
            <OpenAITab />
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
              ? tCommon('loading')
              : isSpeaking
                ? tCommon('stop')
                : t('testButton')}
          </Button>
          <p className="text-muted-foreground mt-2 text-xs">
            {t('playsWord', { word: TEST_WORD })}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
