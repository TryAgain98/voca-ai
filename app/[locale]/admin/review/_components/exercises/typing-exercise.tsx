'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Lightbulb } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { SpeakButton } from '~/components/layout/speak-button'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { useTTS } from '~/hooks/use-tts'
import { cn } from '~/lib/cn'
import { playCorrectSound, playWrongSound } from '~/lib/feedback-sound'

import { ExerciseFeedback } from './exercise-feedback'

import type { TypingExercise } from '../../_types/review.types'

const CORRECT_ADVANCE_DELAY_MS = 1200

function buildBlankHint(word: string): string {
  return word
    .split('')
    .map(() => '_')
    .join(' ')
}

function buildFirstLetterHint(word: string): string {
  if (word.length <= 1) return word
  return (
    word[0] +
    ' ' +
    word
      .slice(1)
      .split('')
      .map(() => '_')
      .join(' ')
  )
}

interface TypingExerciseCardProps {
  exercise: TypingExercise
  onAnswer: (isCorrect: boolean) => void
}

export function TypingExerciseCard({
  exercise,
  onAnswer,
}: TypingExerciseCardProps) {
  const t = useTranslations('Review')
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showFirstLetter, setShowFirstLetter] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { speak } = useTTS(exercise.vocab.word)
  const isListenMode = exercise.type === 'listen-to-word'
  const accentColor = isListenMode ? 'amber' : 'sky'

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!isListenMode) return
    const timer = setTimeout(() => speak(), 500)
    return () => clearTimeout(timer)
    // speak is stable within TTS module lifecycle; no dep needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListenMode])

  const handleSubmit = () => {
    if (submitted || !value.trim()) return
    const correct =
      value.trim().toLowerCase() === exercise.vocab.word.toLowerCase()
    setIsCorrect(correct)
    setSubmitted(true)
    if (correct) {
      playCorrectSound()
      setTimeout(() => onAnswer(true), CORRECT_ADVANCE_DELAY_MS)
    } else {
      playWrongSound()
    }
  }

  const hint = showFirstLetter
    ? buildFirstLetterHint(exercise.vocab.word)
    : buildBlankHint(exercise.vocab.word)

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={exercise.vocab.id + exercise.type}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'relative overflow-hidden rounded-2xl px-6 py-5',
            accentColor === 'amber'
              ? 'border border-amber-500/20 bg-amber-500/5'
              : 'border border-sky-500/20 bg-sky-500/5',
          )}
        >
          <div
            className={cn(
              'absolute inset-x-0 top-0 h-px',
              accentColor === 'amber' ? 'bg-amber-400/40' : 'bg-sky-400/40',
            )}
          />
          {isListenMode ? (
            <div className="flex items-center gap-3">
              <SpeakButton text={exercise.vocab.word} />
              <p className="text-muted-foreground text-sm">
                {t('listenAndType')}
              </p>
            </div>
          ) : (
            <>
              <p className="text-xl font-medium">{exercise.vocab.meaning}</p>
              {exercise.vocab.example && (
                <p className="text-muted-foreground/70 mt-1.5 text-xs italic">
                  &ldquo;{exercise.vocab.example}&rdquo;
                </p>
              )}
              <p className="text-muted-foreground mt-3 text-xs">
                {t('typeTheWord')}
              </p>
            </>
          )}
          {exercise.vocab.phonetic && (
            <p className="text-muted-foreground/50 mt-1 font-mono text-xs">
              {exercise.vocab.phonetic}
            </p>
          )}
          <p className="text-muted-foreground/60 mt-2 font-mono text-sm tracking-widest">
            {hint}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        <div className={cn('flex gap-2', submitted && 'pointer-events-none')}>
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={t('typeHere')}
            disabled={submitted}
            className={cn(
              'text-base',
              submitted &&
                isCorrect &&
                'border-green-500/60 bg-green-950/20 text-green-300',
              submitted &&
                !isCorrect &&
                'border-red-400/60 bg-red-950/20 text-red-400',
            )}
          />
          <Button onClick={handleSubmit} disabled={!value.trim() || submitted}>
            {t('check')}
          </Button>
        </div>

        <ExerciseFeedback
          show={submitted}
          isCorrect={isCorrect}
          onContinue={() => onAnswer(false)}
          correctAnswer={exercise.vocab.word}
        />

        {!submitted && !showFirstLetter && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground w-fit"
            onClick={() => setShowFirstLetter(true)}
          >
            <Lightbulb size={14} className="mr-1.5" />
            {t('showHint')}
          </Button>
        )}
      </div>
    </div>
  )
}
