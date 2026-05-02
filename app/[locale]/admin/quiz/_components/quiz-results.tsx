'use client'

import { motion } from 'framer-motion'
import { ClipboardList, RefreshCw, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import { useSaveQuizSession } from '~/hooks/use-quiz-sessions'

import type { QuizExerciseResult, QuizSetup } from '../_types/quiz.types'
import type { QuizIncorrectWord } from '~/types'

interface QuizResultsProps {
  setup: QuizSetup
  results: QuizExerciseResult[]
  startTime: Date
  elapsedSeconds: number
  onPlayAgain: () => void
  onChangeSetup: () => void
}

export function QuizResults({
  setup,
  results,
  startTime,
  elapsedSeconds,
  onPlayAgain,
  onChangeSetup,
}: QuizResultsProps) {
  const t = useTranslations('Quiz')
  const { mutate: saveSession } = useSaveQuizSession()
  const savedRef = useRef(false)

  const correctCount = results.filter((r) => r.isCorrect).length
  const total = results.length
  const score = total > 0 ? correctCount / total : 0
  const mistakes = results.filter((r) => !r.isCorrect)

  useEffect(() => {
    if (savedRef.current) return
    savedRef.current = true

    const incorrectWords: QuizIncorrectWord[] = mistakes.map((r) => ({
      word_id: r.exercise.vocab.id,
      word: r.exercise.vocab.word,
      meaning: r.exercise.vocab.meaning,
      user_answer: r.userAnswer ?? '',
      correct_answer:
        r.exercise.type === 'word-to-meaning'
          ? r.exercise.vocab.meaning
          : r.exercise.vocab.word,
    }))

    saveSession(
      {
        user_id: setup.userId,
        lesson_ids: setup.lessonIds,
        start_time: startTime.toISOString(),
        end_time: new Date().toISOString(),
        total_questions: total,
        correct_count: correctCount,
        score,
        incorrect_words: incorrectWords,
      },
      {
        onSuccess: () => toast.success(t('sessionSaved')),
      },
    )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
          {correctCount} / {total}
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          {t('resultsTime', { seconds: elapsedSeconds })}
        </p>
      </div>

      {mistakes.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">{t('mistakesTitle')}</p>
          {mistakes.map((r, i) => (
            <div key={i} className="rounded-xl border px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <XCircle size={14} className="shrink-0 text-red-500" />
                <span className="font-semibold">{r.exercise.vocab.word}</span>
              </div>
              <p className="text-muted-foreground mt-1 pl-5 text-xs">
                {t('correctAnswer')}: {r.exercise.vocab.meaning}
              </p>
              {r.userAnswer && (
                <p className="mt-0.5 pl-5 text-xs text-red-400">
                  {t('yourAnswer')}: {r.userAnswer}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={onChangeSetup}
        >
          <ClipboardList size={14} />
          {t('viewHistory')}
        </Button>
        <Button className="flex-1 gap-2" onClick={onPlayAgain}>
          <RefreshCw size={14} />
          {t('playAgain')}
        </Button>
      </div>
    </motion.div>
  )
}
