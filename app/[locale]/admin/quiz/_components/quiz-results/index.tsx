'use client'

import { motion } from 'framer-motion'
import { ClipboardList } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import { useSaveQuizSession } from '~/hooks/use-quiz-sessions'
import { useRecordStreakActivity } from '~/hooks/use-streak'
import { useApplyQuizMastery } from '~/hooks/use-word-mastery'
import { dayjs } from '~/lib/dayjs'

import { AnswersBreakdown } from './answers-breakdown'
import { ConfettiBurst } from './confetti-burst'
import { ResultsHero } from './results-hero'
import { getScoreTier } from './score-tier'

import type { QuizExerciseResult, QuizSetup } from '../../_types/quiz.types'
import type { QuizIncorrectWord } from '~/types'
import type { Exercise } from '~admin/review/_types/review.types'

interface QuizResultsProps {
  setup: QuizSetup
  results: QuizExerciseResult[]
  startTime: Date
  elapsedSeconds: number
  onViewHistory: () => void
}

function getExpectedAnswer(exercise: Exercise): string {
  return exercise.type === 'word-to-meaning'
    ? exercise.vocab.meaning
    : exercise.vocab.word
}

export function QuizResults({
  setup,
  results,
  startTime,
  elapsedSeconds,
  onViewHistory,
}: QuizResultsProps) {
  const t = useTranslations('Quiz')
  const locale = useLocale()
  const router = useRouter()
  const { mutate: saveSession } = useSaveQuizSession()
  const { mutate: applyMastery, isPending: isSaving } = useApplyQuizMastery()
  const { mutate: recordStreak } = useRecordStreakActivity()
  const savedRef = useRef(false)

  const correctCount = results.filter((r) => r.isCorrect).length
  const total = results.length
  const score = total > 0 ? correctCount / total : 0
  const tier = getScoreTier(score)

  const handleViewHistory = () => {
    onViewHistory()
    router.push(`/${locale}/admin/quiz/history`)
  }

  useEffect(() => {
    if (savedRef.current) return
    savedRef.current = true

    const incorrectWords: QuizIncorrectWord[] = results
      .filter((r) => !r.isCorrect)
      .map((r) => ({
        word_id: r.exercise.vocab.id,
        word: r.exercise.vocab.word,
        meaning: r.exercise.vocab.meaning,
        user_answer: r.userAnswer ?? '',
        correct_answer: getExpectedAnswer(r.exercise),
      }))

    saveSession(
      {
        user_id: setup.userId,
        lesson_ids: setup.lessonIds,
        start_time: startTime.toISOString(),
        end_time: dayjs().toISOString(),
        total_questions: total,
        correct_count: correctCount,
        score,
        incorrect_words: incorrectWords,
      },
      {
        onSuccess: () => toast.success(t('sessionSaved')),
      },
    )

    applyMastery({
      userId: setup.userId,
      results: results.map((r) => ({
        wordId: r.exercise.vocab.id,
        word: r.exercise.vocab.word,
        isCorrect: r.answerCorrect ?? r.isCorrect,
        responseMs: r.responseMs,
        usedHint: r.usedHint,
      })),
    })

    recordStreak(setup.userId)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <ConfettiBurst active={tier.confetti} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto flex max-w-lg flex-col gap-5"
      >
        <ResultsHero
          total={total}
          elapsedSeconds={elapsedSeconds}
          score={score}
          tier={tier}
        />

        <AnswersBreakdown results={results} />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex"
        >
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleViewHistory}
            disabled={isSaving}
          >
            <ClipboardList size={14} />
            {t('viewHistory')}
          </Button>
        </motion.div>
      </motion.div>
    </>
  )
}
