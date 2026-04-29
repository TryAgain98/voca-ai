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
    <div className="flex flex-col gap-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={exercise.vocab.id + exercise.type}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-card flex flex-col items-center gap-3 rounded-2xl border px-8 py-8 text-center shadow-sm"
        >
          {isListenMode ? (
            <>
              <SpeakButton text={exercise.vocab.word} />
              <p className="text-muted-foreground text-sm">
                {t('listenAndType')}
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-medium">{exercise.vocab.meaning}</p>
              <p className="text-muted-foreground text-sm">
                {t('typeTheWord')}
              </p>
            </>
          )}
          <p className="text-muted-foreground mt-1 font-mono tracking-widest">
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
                'border-green-500 bg-green-950/20 text-green-300',
              submitted &&
                !isCorrect &&
                'border-red-400 bg-red-950/20 text-red-400',
            )}
          />
          <Button onClick={handleSubmit} disabled={!value.trim() || submitted}>
            {t('check')}
          </Button>
        </div>

        <AnimatePresence>
          {submitted && isCorrect && (
            <motion.p
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="text-center text-lg font-semibold text-green-400"
            >
              {t('correct')}
            </motion.p>
          )}
          {submitted && !isCorrect && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3"
            >
              <p className="text-sm">
                <span className="text-muted-foreground">
                  {t('correctAnswer')}:{' '}
                </span>
                <span className="font-semibold text-green-400">
                  {exercise.vocab.word}
                </span>
              </p>
              <Button onClick={() => onAnswer(false)} className="w-full">
                {t('continueBtn')}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

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
