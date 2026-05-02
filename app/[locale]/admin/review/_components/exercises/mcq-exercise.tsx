'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { useTTS } from '~/hooks/use-tts'
import { cn } from '~/lib/cn'
import { playCorrectSound, playWrongSound } from '~/lib/feedback-sound'

import { ExerciseFeedback } from './exercise-feedback'

import type { MCQExercise } from '../../_types/review.types'

const CORRECT_ADVANCE_DELAY_MS = 1200

interface MCQExerciseCardProps {
  exercise: MCQExercise
  onAnswer: (isCorrect: boolean, userAnswer?: string) => void
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
      return 'border-gray-400/40 hover:border-indigo-400/60 hover:bg-indigo-500/5'
    if (idx === exercise.correctIndex)
      return 'border-green-500/60 bg-green-950/40 text-green-300'
    if (idx === selected) return 'border-red-400/60 bg-red-950/40 text-red-400'
    return 'border-gray-400/20 opacity-40'
  }

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={exercise.vocab.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-6 py-5"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-indigo-400/40" />
          <div className="flex items-baseline gap-2.5">
            <p className="text-3xl font-semibold tracking-tight">
              {exercise.vocab.word}
            </p>
            {exercise.vocab.phonetic && (
              <span className="text-muted-foreground font-mono text-sm">
                {exercise.vocab.phonetic}
              </span>
            )}
          </div>
          {exercise.vocab.word_type && (
            <span className="mt-1 inline-block rounded bg-indigo-500/15 px-1.5 py-0.5 text-xs text-indigo-300">
              {exercise.vocab.word_type}
            </span>
          )}
          {exercise.vocab.example && (
            <p className="text-muted-foreground/70 mt-2 text-xs italic">
              &ldquo;{exercise.vocab.example}&rdquo;
            </p>
          )}
          <p className="text-muted-foreground mt-3 text-xs">
            {t('chooseMeaning')}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-2.5">
        {exercise.options.map((opt, idx) => (
          <motion.button
            key={idx}
            whileTap={{ scale: selected === null ? 0.97 : 1 }}
            onClick={() => handleSelect(idx)}
            disabled={selected !== null}
            className={cn(
              'rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all',
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
        onContinue={() =>
          onAnswer(
            false,
            selected !== null ? exercise.options[selected] : undefined,
          )
        }
      />
    </div>
  )
}
