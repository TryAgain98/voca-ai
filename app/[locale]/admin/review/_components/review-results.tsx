'use client'

import { motion } from 'framer-motion'
import {
  BookOpen,
  Loader2,
  RefreshCw,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { useTTS } from '~/hooks/use-tts'
import { cn } from '~/lib/cn'

import { StoryGenrePicker } from './story-genre-picker'

import type { ExerciseResult } from '../_types/review.types'
import type { StoryWord } from '~/types'

const STORY_MISTAKE_THRESHOLD = 5

interface ReviewResultsProps {
  results: ExerciseResult[]
  elapsedSeconds: number
  userId: string
  onRestart: () => void
  onChangeSetup: () => void
}

interface MistakeItemProps {
  word: string
  meaning: string
}

function MistakeItem({ word, meaning }: MistakeItemProps) {
  const t = useTranslations('Review')
  const { speak, isSpeaking, isLoading } = useTTS(word)

  return (
    <div className="rounded-xl border px-4 py-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <XCircle size={14} className="shrink-0 text-red-500" />
          <span className="font-semibold">{word}</span>
        </div>
        <button
          onClick={speak}
          className={cn(
            'flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors',
            isSpeaking
              ? 'text-emerald-400'
              : 'text-muted-foreground hover:text-foreground',
          )}
          aria-label={t('listenBtn')}
        >
          {isLoading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : isSpeaking ? (
            <VolumeX size={13} />
          ) : (
            <Volume2 size={13} />
          )}
        </button>
      </div>
      <p className="text-muted-foreground mt-1 pl-5 text-xs">{meaning}</p>
    </div>
  )
}

export function ReviewResults({
  results,
  elapsedSeconds,
  userId,
  onRestart,
  onChangeSetup,
}: ReviewResultsProps) {
  const t = useTranslations('Review')
  const [showGenrePicker, setShowGenrePicker] = useState(false)

  const originals = results.filter((r) => !r.exercise.isReinforcement)
  const correct = originals.filter((r) => r.isCorrect)
  const mistakes = originals.filter((r) => !r.isCorrect)

  const wrongWords: StoryWord[] = mistakes.map((r) => ({
    id: r.exercise.vocab.id,
    word: r.exercise.vocab.word,
    meaning: r.exercise.vocab.meaning,
    phonetic: r.exercise.vocab.phonetic,
    word_type: r.exercise.vocab.word_type,
    example: r.exercise.vocab.example,
    synonyms: r.exercise.vocab.synonyms,
    description: r.exercise.vocab.description,
  }))

  const showStoryOffer = mistakes.length >= STORY_MISTAKE_THRESHOLD

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto flex max-w-lg flex-col gap-6"
    >
      <div className="bg-card rounded-2xl border px-8 py-8 text-center">
        <p className="text-muted-foreground mb-2 text-sm font-medium tracking-wider uppercase">
          {t('resultsTitle')}
        </p>
        <p className="text-primary text-5xl font-bold">
          {correct.length} / {originals.length}
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          {t('resultsTime', { seconds: elapsedSeconds })}
        </p>
      </div>

      {mistakes.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">{t('mistakesTitle')}</p>
          {mistakes.map((r, i) => (
            <MistakeItem
              key={i}
              word={r.exercise.vocab.word}
              meaning={r.exercise.vocab.meaning}
            />
          ))}
        </div>
      )}

      {showStoryOffer && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card flex flex-col gap-4 rounded-2xl border px-6 py-5"
        >
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <BookOpen size={15} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-[510]">{t('storyOfferTitle')}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {t('storyOfferDesc', { count: mistakes.length })}
              </p>
            </div>
          </div>

          {showGenrePicker ? (
            <StoryGenrePicker userId={userId} wrongWords={wrongWords} />
          ) : (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowGenrePicker(true)}
            >
              <BookOpen size={14} />
              {t('storyOfferBtn')}
            </Button>
          )}
        </motion.div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onChangeSetup}>
          {t('changeSetup')}
        </Button>
        <Button className="flex-1 gap-2" onClick={onRestart}>
          <RefreshCw size={14} />
          {t('playAgain')}
        </Button>
      </div>
    </motion.div>
  )
}
