'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Lightbulb, TriangleAlert } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'

import { SpeakButton } from '~/components/layout/speak-button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { useTTS } from '~/hooks/use-tts'
import { checkAnswer } from '~/lib/answer-pattern'
import { cn } from '~/lib/cn'
import { playCorrectSound, playWrongSound } from '~/lib/feedback-sound'

import {
  buildFillSlots,
  getMaxManualHints,
  shuffledLetterPositions,
} from './_utils/answer-fill'
import { ExerciseFeedback } from './exercise-feedback'
import { FillPatternDisplay } from './fill-pattern-display'

import type { ExerciseMode } from './mcq-exercise'
import type { AnswerHandler, TypingExercise } from '../../_types/review.types'

const CORRECT_ADVANCE_DELAY_MS = 1200
const QUIZ_ADVANCE_DELAY_MS = 280

function elapsedSince(start: number): number {
  return Date.now() - start
}

interface TypingExerciseCardProps {
  exercise: TypingExercise
  onAnswer: AnswerHandler
  mode?: ExerciseMode
  onQuizSubmit?: () => void
  onQuizHint?: () => void
}

export function TypingExerciseCard({
  exercise,
  onAnswer,
  mode = 'review',
  onQuizSubmit,
  onQuizHint,
}: TypingExerciseCardProps) {
  const t = useTranslations('Review')
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [manualHintCount, setManualHintCount] = useState(0)
  const [collisionMatched, setCollisionMatched] = useState<string | null>(null)
  const [isSynonymMatch, setIsSynonymMatch] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const startedAtRef = useRef<number>(0)
  const speechStartedRef = useRef(false)
  const { speak, isSpeaking } = useTTS(exercise.vocab.word)
  const isListenMode = exercise.type === 'listen-to-word'
  const accentColor = isListenMode ? 'amber' : 'sky'
  const isQuiz = mode === 'quiz'

  const word = exercise.vocab.word
  const revealOrder = useMemo(() => shuffledLetterPositions(word), [word])
  const letterCount = revealOrder.length
  const maxManualHints = isQuiz
    ? Math.max(0, Math.min(letterCount - 1, getMaxManualHints(letterCount) + 1))
    : getMaxManualHints(letterCount)
  const usedHint = manualHintCount > 0

  const revealedSet = useMemo(() => {
    const set = new Set<number>()
    const freeHints = isQuiz ? 0 : 1
    for (let i = 0; i < freeHints + manualHintCount; i++) {
      const pos = revealOrder[i]
      if (pos != null) set.add(pos)
    }
    return set
  }, [isQuiz, revealOrder, manualHintCount])

  const slots = useMemo(
    () => buildFillSlots(word, value, revealedSet),
    [word, value, revealedSet],
  )

  const canShowHint = !submitted && manualHintCount < maxManualHints

  useEffect(() => {
    if (!isListenMode) startedAtRef.current = Date.now()
    speechStartedRef.current = false
    inputRef.current?.focus()
  }, [isListenMode])

  useEffect(() => {
    if (!isListenMode) return
    const timer = setTimeout(() => speak(), 500)
    return () => clearTimeout(timer)
    // speak is stable within TTS module lifecycle; no dep needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListenMode])

  // For listen mode: reset timer when audio actually begins (accounts for Windows TTS cold-start latency)
  useEffect(() => {
    if (!isListenMode || !isSpeaking || speechStartedRef.current) return
    speechStartedRef.current = true
    startedAtRef.current = Date.now()
  }, [isListenMode, isSpeaking])

  const handleSubmit = () => {
    if (submitted || !value.trim()) return
    if (isQuiz) onQuizSubmit?.()
    const verdict = checkAnswer(exercise.vocab, value, exercise.siblings)
    const correct = verdict.kind !== 'wrong'
    const scoredCorrect = correct && !usedHint
    const matchedSiblingId =
      verdict.kind === 'collision' ? verdict.matched.id : null
    setIsCorrect(correct)
    setCollisionMatched(matchedSiblingId)
    setIsSynonymMatch(verdict.kind === 'synonym')
    setSubmitted(true)
    const responseMs = elapsedSince(startedAtRef.current)
    const meta = {
      userAnswer: value.trim(),
      responseMs,
      usedHint,
      answerCorrect: correct,
      acceptedSiblingId: matchedSiblingId ?? undefined,
    }
    if (isQuiz) {
      setTimeout(() => onAnswer(scoredCorrect, meta), QUIZ_ADVANCE_DELAY_MS)
      return
    }
    if (correct) {
      playCorrectSound()
      setTimeout(() => onAnswer(true, meta), CORRECT_ADVANCE_DELAY_MS)
    } else {
      playWrongSound()
    }
  }

  const handleRevealHint = () => {
    if (!canShowHint) return
    setManualHintCount((c) => c + 1)
    if (isQuiz) onQuizHint?.()
  }

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
          <FillPatternDisplay slots={slots} className="mt-3" />
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

        {!isQuiz &&
          submitted &&
          isCorrect &&
          (collisionMatched || isSynonymMatch) && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-amber-300/90"
            >
              {t('synonymAccepted', { expected: exercise.vocab.word })}
            </motion.p>
          )}

        {!isQuiz && (
          <ExerciseFeedback
            show={submitted}
            isCorrect={isCorrect}
            onContinue={() =>
              onAnswer(false, {
                userAnswer: value.trim(),
                responseMs: elapsedSince(startedAtRef.current),
                usedHint,
              })
            }
            correctAnswer={exercise.vocab.word}
            synonyms={exercise.vocab.synonyms}
          />
        )}

        {isQuiz && usedHint && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-amber-300/90"
          >
            {t('quizHintPenaltyActive')}
          </motion.p>
        )}

        {!isQuiz && canShowHint && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground w-fit"
            onClick={handleRevealHint}
          >
            <Lightbulb size={14} className="mr-1.5" />
            {manualHintCount === 0 ? t('showHint') : t('showMoreHint')}
          </Button>
        )}

        {isQuiz && canShowHint && (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-fit text-amber-300 hover:text-amber-200"
                />
              }
            >
              <Lightbulb size={14} className="mr-1.5" />
              {manualHintCount === 0 ? t('showHint') : t('showMoreHint')}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-amber-500/10 text-amber-400">
                  <TriangleAlert size={20} />
                </AlertDialogMedia>
                <AlertDialogTitle>{t('quizHintPenaltyTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('quizHintPenaltyDesc')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('quizHintCancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleRevealHint}>
                  {t('quizHintConfirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}
