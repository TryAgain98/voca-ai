'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

import { SpeakExercise } from '../../../../_types/review.types'

import { ListenButton } from './listen-button'

interface VocabCardProps {
  exercise: SpeakExercise
  isSpeaking: boolean
  isLoading: boolean
  onListen: () => void
}

export function VocabCard({
  exercise,
  isSpeaking,
  isLoading,
  onListen,
}: VocabCardProps) {
  const t = useTranslations('Review')
  const { vocab } = exercise
  return (
    <motion.div
      key={vocab.id}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-5"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-emerald-400/40" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2.5">
            <p className="text-2xl font-semibold tracking-tight">
              {vocab.word}
            </p>
            {vocab.phonetic && (
              <span className="text-muted-foreground font-mono text-sm">
                {vocab.phonetic}
              </span>
            )}
          </div>
          {vocab.word_type && (
            <span className="w-fit rounded bg-emerald-500/15 px-1.5 py-0.5 text-xs text-emerald-300">
              {vocab.word_type}
            </span>
          )}
        </div>
        <ListenButton
          isSpeaking={isSpeaking}
          isLoading={isLoading}
          onClick={onListen}
        />
      </div>
      <p className="text-muted-foreground mt-2 text-sm">{vocab.meaning}</p>
      {vocab.example && (
        <p className="text-muted-foreground/70 mt-1.5 text-xs italic">
          &ldquo;{vocab.example}&rdquo;
        </p>
      )}
      <p className="text-muted-foreground/60 mt-3 text-xs">
        {t('speakInstructions')}
      </p>
    </motion.div>
  )
}
