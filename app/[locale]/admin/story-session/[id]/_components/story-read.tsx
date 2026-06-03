'use client'

import { Eye, EyeOff, Volume2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { useTTS } from '~/hooks/use-tts'
import { cn } from '~/lib/cn'
import { useTTSSettingsStore } from '~/stores/tts-settings'

import type { StoryWord } from '~/types'

interface StoryReadProps {
  passageText: string
  translation: string
  targetWords: StoryWord[]
  onComplete: () => void
  isLoading: boolean
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function tokenize(text: string): string[] {
  return text.split(/(\b[\w']+\b)/).filter(Boolean)
}

function highlightMeaning(
  text: string,
  meaning: string | null,
): React.ReactNode {
  if (!meaning) return text
  const idx = text.toLowerCase().indexOf(meaning.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-primary rounded-sm px-0.5 not-italic">
        {text.slice(idx, idx + meaning.length)}
      </mark>
      {text.slice(idx + meaning.length)}
    </>
  )
}

interface SentenceBlockProps {
  sentence: string
  targetWords: StoryWord[]
  onWordEnter: (meaning: string | null) => void
  onWordLeave: () => void
  onWordClick: (word: string) => void
}

function SentenceBlock({
  sentence,
  targetWords,
  onWordEnter,
  onWordLeave,
  onWordClick,
}: SentenceBlockProps) {
  const { speak, isSpeaking } = useTTS(sentence)
  const tokens = tokenize(sentence)

  return (
    <span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          speak()
        }}
        className={cn(
          'mr-1 inline-block rounded p-0.5 align-middle transition-colors',
          isSpeaking
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Volume2 size={12} />
      </button>
      {tokens.map((tok, i) => {
        if (!/\w/.test(tok)) return <span key={i}>{tok}</span>
        const target = targetWords.find(
          (w) => w.word.toLowerCase() === tok.toLowerCase(),
        )
        return (
          <span
            key={i}
            title={target?.meaning}
            onClick={() => onWordClick(tok)}
            onMouseEnter={() => onWordEnter(target?.meaning ?? null)}
            onMouseLeave={onWordLeave}
            className={cn(
              'cursor-pointer transition-colors',
              target
                ? 'bg-primary/15 text-primary hover:bg-primary/25 rounded px-0.5 font-[590] underline decoration-dotted underline-offset-2'
                : 'hover:text-primary',
            )}
          >
            {tok}
          </span>
        )
      })}{' '}
    </span>
  )
}

export function StoryRead({
  passageText,
  translation,
  targetWords,
  onComplete,
  isLoading,
}: StoryReadProps) {
  const t = useTranslations('Story')
  const [showTranslation, setShowTranslation] = useState(false)
  const [hoveredMeaning, setHoveredMeaning] = useState<string | null>(null)

  const engine = useTTSSettingsStore((s) => s.engine)
  const openaiVoice = useTTSSettingsStore((s) => s.openaiVoice)
  const openaiSpeed = useTTSSettingsStore((s) => s.openaiSpeed)
  const webSpeechRate = useTTSSettingsStore((s) => s.webSpeechRate)
  const webSpeechVoiceURI = useTTSSettingsStore((s) => s.webSpeechVoiceURI)

  const enSentences = splitSentences(passageText)
  const viSentences = splitSentences(translation)

  function speakWord(word: string) {
    if (engine === 'web-speech') {
      if (typeof window === 'undefined' || !window.speechSynthesis) return
      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(word)
      utt.lang = 'en-US'
      utt.rate = webSpeechRate
      if (webSpeechVoiceURI) {
        const voice = window.speechSynthesis
          .getVoices()
          .find((v) => v.voiceURI === webSpeechVoiceURI)
        if (voice) utt.voice = voice
      }
      window.speechSynthesis.speak(utt)
    } else {
      const params = new URLSearchParams({
        text: word,
        voice: openaiVoice,
        speed: String(openaiSpeed),
      })
      new Audio(`/api/tts?${params}`).play().catch(() => {})
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-card rounded-2xl border px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-muted-foreground text-xs font-[510] tracking-wider uppercase">
            {t('readInstruction')}
          </p>
          <button
            onClick={() => setShowTranslation((v) => !v)}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
          >
            {showTranslation ? <EyeOff size={12} /> : <Eye size={12} />}
            {showTranslation
              ? t('readHideTranslation')
              : t('readShowTranslation')}
          </button>
        </div>

        <p className="text-foreground leading-loose">
          {enSentences.map((sentence, i) => (
            <SentenceBlock
              key={i}
              sentence={sentence}
              targetWords={targetWords}
              onWordEnter={setHoveredMeaning}
              onWordLeave={() => setHoveredMeaning(null)}
              onWordClick={speakWord}
            />
          ))}
        </p>

        {showTranslation && (
          <div className="border-border mt-4 space-y-1 border-t pt-4">
            {viSentences.map((vi, i) => (
              <p
                key={i}
                className="text-muted-foreground text-sm leading-relaxed italic"
              >
                {highlightMeaning(vi, hoveredMeaning)}
              </p>
            ))}
          </div>
        )}

        <p className="text-muted-foreground mt-4 text-xs">
          {t('readHoverHint')}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {targetWords.map((w) => (
          <div key={w.id} className="bg-muted rounded-lg px-3 py-1.5 text-xs">
            <span className="font-[590]">{w.word}</span>
            <span className="text-muted-foreground"> — {w.meaning}</span>
          </div>
        ))}
      </div>

      <Button onClick={onComplete} disabled={isLoading} className="w-full">
        {t('readDoneBtn')}
      </Button>
    </div>
  )
}
