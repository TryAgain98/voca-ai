'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SpeakButton } from '~/components/layout/speak-button'
import { cn } from '~/lib/cn'
import { GRADE_EASY, GRADE_GOOD, deriveGrade } from '~/lib/mastery-scheduler'

import { markActualChars } from './diff-chars'

import type { QuizExerciseResult } from '../../_types/quiz.types'
import type { Exercise } from '~admin/review/_types/review.types'

type DifficultyLevel = 'easy' | 'good' | 'hard'

function getExpectedAnswer(exercise: Exercise): string {
  return exercise.type === 'word-to-meaning'
    ? exercise.vocab.meaning
    : exercise.vocab.word
}

function getDifficultyLevel(
  isCorrect: boolean,
  word: string,
  responseMs?: number,
  usedHint?: boolean,
): DifficultyLevel {
  const grade = deriveGrade({ isCorrect, responseMs, usedHint, word })
  if (grade >= GRADE_EASY) return 'easy'
  if (grade >= GRADE_GOOD) return 'good'
  return 'hard'
}

function formatResponseTime(ms?: number): string {
  if (ms == null) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

const DIFFICULTY_STYLES: Record<DifficultyLevel, string> = {
  easy: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  good: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  hard: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
}

interface DifficultyBadgeProps {
  level: DifficultyLevel
}

function DifficultyBadge({ level }: DifficultyBadgeProps) {
  const t = useTranslations('Quiz.results.difficulty')
  return (
    <span
      className={cn(
        'rounded border px-1.5 py-0.5 text-[10px] leading-none font-[510]',
        DIFFICULTY_STYLES[level],
      )}
    >
      {t(level)}
    </span>
  )
}

interface DiffHighlightProps {
  expected: string
  actual: string
}

function DiffHighlight({ expected, actual }: DiffHighlightProps) {
  const matched = markActualChars(expected, actual)
  return (
    <span className="font-mono font-[510]">
      {actual.split('').map((char, i) => (
        <span
          key={i}
          className={matched[i] ? 'text-foreground' : 'text-rose-500'}
        >
          {char}
        </span>
      ))}
    </span>
  )
}

export interface AnswerRowProps {
  result: QuizExerciseResult
  index: number
}

export function AnswerRow({ result, index }: AnswerRowProps) {
  const t = useTranslations('Quiz.results')
  const expected = getExpectedAnswer(result.exercise)
  const { isCorrect, responseMs, usedHint } = result
  const difficulty = getDifficultyLevel(
    isCorrect,
    expected,
    responseMs,
    usedHint,
  )

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className={cn(
        'flex items-start gap-2.5 rounded-lg border px-3 py-2',
        isCorrect
          ? 'border-emerald-500/15 bg-emerald-500/[0.04]'
          : 'border-rose-500/20 bg-rose-500/[0.05]',
      )}
    >
      {isCorrect ? (
        <CheckCircle2
          size={16}
          className="mt-0.5 shrink-0 text-emerald-500"
          strokeWidth={2}
        />
      ) : (
        <XCircle
          size={16}
          className="mt-0.5 shrink-0 text-rose-500"
          strokeWidth={2}
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-foreground text-sm font-[590]">
            {result.exercise.vocab.word}
          </span>
          <SpeakButton
            text={result.exercise.vocab.word}
            className="-my-1 size-6"
          />
          <span className="text-muted-foreground text-xs">
            — {result.exercise.vocab.meaning}
          </span>
          <DifficultyBadge level={difficulty} />
          {responseMs != null && (
            <span className="text-muted-foreground/60 flex items-center gap-0.5 text-[10px]">
              <Clock size={10} />
              {formatResponseTime(responseMs)}
            </span>
          )}
        </div>
        {!isCorrect && (
          <div className="mt-1 flex flex-wrap items-baseline gap-x-4 text-xs">
            <span className="text-muted-foreground/70">
              {t('expected')}:{' '}
              <span className="font-[510] text-emerald-500">{expected}</span>
            </span>
            {result.userAnswer && (
              <span className="text-muted-foreground/70">
                {t('yourAnswer')}:{' '}
                <DiffHighlight expected={expected} actual={result.userAnswer} />
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
