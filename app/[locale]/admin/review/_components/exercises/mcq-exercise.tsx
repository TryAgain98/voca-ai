'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { SpeakButton } from '~/components/layout/speak-button'
import { useTTS } from '~/hooks/use-tts'
import { cn } from '~/lib/cn'
import { playCorrectSound, playWrongSound } from '~/lib/feedback-sound'

import { ExerciseFeedback } from './exercise-feedback'

import type { MCQExercise } from '../../_types/review.types'

const CORRECT_ADVANCE_DELAY_MS = 1200

interface MCQExerciseCardProps {
  exercise: MCQExercise
  onAnswer: (isCorrect: boolean) => void
}

export function MCQExerciseCard({ exercise, onAnswer }: MCQExerciseCardProps) {
  const t = useTranslations('Review')
  const [selected, setSelected] = useState<number | null>(null)
  const { speak } = useTTS(exercise.vocab.word)

  useEffect(() => {
    const timer = setTimeout(() => speak(), 400)
    return () => clearTimeout(timer)
    // speak is stable within TTS module lifecycle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isCorrect = selected !== null && selected === exercise.correctIndex

  const handleSelect = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    if (idx === exercise.correctIndex) {
      playCorrectSound()
      setTimeout(() => onAnswer(true), CORRECT_ADVANCE_DELAY_MS)
    } else {
      playWrongSound()
    }
  }

  const getOptionStyle = (idx: number): string => {
    if (selected === null)
      return 'border-border hover:border-primary/60 hover:bg-primary/5'
    if (idx === exercise.correctIndex)
      return 'border-green-500 bg-green-950/40 text-green-300'
    if (idx === selected) return 'border-red-400 bg-red-950/40 text-red-400'
    return 'border-border opacity-40'
  }

  return (
    <div className="flex flex-col gap-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={exercise.vocab.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.2 }}
          className="bg-card rounded-2xl border px-8 py-10 text-center shadow-sm"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-bold tracking-tight">
              {exercise.vocab.word}
            </span>
            <SpeakButton text={exercise.vocab.word} className="mt-1" />
          </div>
          {exercise.vocab.word_type && (
            <p className="text-muted-foreground mt-1 text-xs italic">
              {exercise.vocab.word_type}
            </p>
          )}
          <p className="text-muted-foreground mt-2 text-sm">
            {t('chooseMeaning')}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3">
        {exercise.options.map((opt, idx) => (
          <motion.button
            key={idx}
            whileTap={{ scale: selected === null ? 0.97 : 1 }}
            onClick={() => handleSelect(idx)}
            disabled={selected !== null}
            className={cn(
              'rounded-xl border-2 px-4 py-4 text-left text-sm font-medium transition-all',
              getOptionStyle(idx),
            )}
          >
            {opt}
          </motion.button>
        ))}
      </div>

      <ExerciseFeedback
        show={selected !== null}
        isCorrect={isCorrect}
        onContinue={() => onAnswer(false)}
      />
    </div>
  )
}
