'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Lightbulb } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'

import { SpeakButton } from '~/components/layout/speak-button'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { useTTS } from '~/hooks/use-tts'
import { cn } from '~/lib/cn'
import { playCorrectSound, playWrongSound } from '~/lib/feedback-sound'

import { ExerciseFeedback } from './exercise-feedback'

import type { ExerciseMode } from './mcq-exercise'
import type { TypingExercise } from '../../_types/review.types'

const CORRECT_ADVANCE_DELAY_MS = 1200
const QUIZ_ADVANCE_DELAY_MS = 280
const HINT_MAX_REVEAL_RATIO = 0.4
const HINT_MAX_LEVELS = 3

function seedFromWord(word: string): number {
  let seed = 0
  for (let i = 0; i < word.length; i++) {
    seed = (seed * 31 + word.charCodeAt(i)) >>> 0
  }
  return seed || 1
}

function buildShuffledRevealOrder(word: string): number[] {
  const indices = Array.from({ length: word.length }, (_, i) => i)
  let seed = seedFromWord(word)
  for (let i = indices.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) >>> 0
    const j = seed % (i + 1)
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
}

function buildHintFromRevealedSet(word: string, revealed: Set<number>): string {
  return word
    .split('')
    .map((ch, i) => (revealed.has(i) ? ch : '_'))
    .join(' ')
}

interface TypingExerciseCardProps {
  exercise: TypingExercise
  onAnswer: (isCorrect: boolean, userAnswer?: string) => void
  mode?: ExerciseMode
}

export function TypingExerciseCard({
  exercise,
  onAnswer,
  mode = 'review',
}: TypingExerciseCardProps) {
  const t = useTranslations('Review')
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { speak } = useTTS(exercise.vocab.word)
  const isListenMode = exercise.type === 'listen-to-word'
  const accentColor = isListenMode ? 'amber' : 'sky'
  const isQuiz = mode === 'quiz'

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
    if (isQuiz) {
      setTimeout(() => onAnswer(correct, value.trim()), QUIZ_ADVANCE_DELAY_MS)
      return
    }
    if (correct) {
      playCorrectSound()
      setTimeout(() => onAnswer(true), CORRECT_ADVANCE_DELAY_MS)
    } else {
      playWrongSound()
    }
  }

  const word = exercise.vocab.word
  const revealOrder = useMemo(() => buildShuffledRevealOrder(word), [word])
  const maxRevealCount =
    word.length <= 1
      ? 0
      : Math.max(1, Math.floor(word.length * HINT_MAX_REVEAL_RATIO))
  const maxLevels = Math.min(HINT_MAX_LEVELS, maxRevealCount)
  const revealPerLevel =
    maxLevels > 0 ? Math.ceil(maxRevealCount / maxLevels) : 0
  const revealCount = Math.min(hintLevel * revealPerLevel, maxRevealCount)
  const revealedSet = useMemo(
    () => new Set(revealOrder.slice(0, revealCount)),
    [revealOrder, revealCount],
  )
  const canShowMoreHint = revealCount < maxRevealCount
  const hint = buildHintFromRevealedSet(word, revealedSet)

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
              <p className="text-muted-foreground mt-3 text-xs">
                {t('typeTheWord')}
              </p>
            </>
          )}
          {/* {exercise.vocab.phonetic && (
            <p className="text-muted-foreground/50 mt-1 font-mono text-xs">
              {exercise.vocab.phonetic}
            </p>
          )} */}
          {!isQuiz && (
            <p className="text-muted-foreground/60 mt-2 font-mono text-sm tracking-widest">
              {hint}
            </p>
          )}
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
              !isQuiz &&
                submitted &&
                isCorrect &&
                'border-green-500/60 bg-green-950/20 text-green-300',
              !isQuiz &&
                submitted &&
                !isCorrect &&
                'border-red-400/60 bg-red-950/20 text-red-400',
              isQuiz &&
                submitted &&
                'border-indigo-400/60 bg-indigo-500/10 text-indigo-200',
            )}
          />
          <Button onClick={handleSubmit} disabled={!value.trim() || submitted}>
            {t('check')}
          </Button>
        </div>

        {!isQuiz && (
          <ExerciseFeedback
            show={submitted}
            isCorrect={isCorrect}
            onContinue={() => onAnswer(false, value.trim())}
            correctAnswer={exercise.vocab.word}
          />
        )}

        {!isQuiz && !submitted && canShowMoreHint && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground w-fit"
            onClick={() => setHintLevel((level) => level + 1)}
          >
            <Lightbulb size={14} className="mr-1.5" />
            {hintLevel === 0 ? t('showHint') : t('showMoreHint')}
          </Button>
        )}
      </div>
    </div>
  )
}
