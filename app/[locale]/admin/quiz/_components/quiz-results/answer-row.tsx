'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Lightbulb, Mic, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SpeakButton } from '~/components/layout/speak-button'
import { WordTypeBadge } from '~/components/word-type-badge'
import { cn } from '~/lib/cn'
import { GRADE_EASY, GRADE_GOOD, deriveGrade } from '~/lib/mastery-scheduler'

import { diffChars } from './diff-chars'

import type { QuizExerciseResult } from '../../_types/quiz.types'
import type { Exercise } from '~admin/review/_types/review.types'

type GradeLevel = 'easy' | 'good' | 'hard' | 'again'

function getExpectedAnswer(exercise: Exercise): string {
  return exercise.type === 'word-to-meaning'
    ? exercise.vocab.meaning
    : exercise.vocab.word
}

function getGradeLevel(
  isCorrect: boolean,
  word: string,
  responseMs?: number,
  usedHint?: boolean,
  pronunciationFailed?: boolean,
): GradeLevel {
  if (!isCorrect) return 'again'
  if (pronunciationFailed) return 'hard'
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

const GRADE_CONFIG: Record<GradeLevel, { style: string; delta: string }> = {
  easy: {
    style: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    delta: '+2',
  },
  good: {
    style: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    delta: '+1',
  },
  hard: {
    style: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    delta: '±0',
  },
  again: {
    style: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    delta: '−1',
  },
}

interface GradeBadgeProps {
  level: GradeLevel
}

function GradeBadge({ level }: GradeBadgeProps) {
  const t = useTranslations('Quiz.results.difficulty')
  const { style, delta } = GRADE_CONFIG[level]
  return (
    <span
      className={cn(
        'rounded border px-1.5 py-0.5 text-[10px] leading-none font-[510]',
        style,
      )}
    >
      {t(level)} <span className="opacity-60">{delta}</span>
    </span>
  )
}

interface DiffHighlightProps {
  expected: string
  actual: string
}

function formatDiffChar(char: string): string {
  return char === ' ' ? '·' : char
}

function DiffHighlight({ expected, actual }: DiffHighlightProps) {
  const ops = diffChars(expected, actual)

  return (
    <span className="font-mono text-xs font-[510] break-words">
      {ops.map((op, i) => (
        <span
          key={`${op.type}-${i}`}
          className={cn(
            op.type === 'match' && 'text-foreground',
            op.type === 'wrong' && 'text-rose-500',
            op.type === 'missing' && 'text-muted-foreground/45',
            op.type === 'extra' &&
              'rounded bg-rose-500/10 px-0.5 text-rose-500',
          )}
        >
          {formatDiffChar(op.char)}
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
  const { isCorrect, responseMs, usedHint, pronunciationFailed } = result
  const answerCorrect = result.answerCorrect ?? isCorrect
  const isHintCorrect = answerCorrect && usedHint && !isCorrect
  const gradeLevel = getGradeLevel(
    answerCorrect,
    result.exercise.vocab.word,
    responseMs,
    usedHint,
    pronunciationFailed,
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
        isCorrect && 'border-emerald-500/15 bg-emerald-500/[0.04]',
        isHintCorrect && 'border-amber-500/20 bg-amber-500/[0.05]',
        !answerCorrect && 'border-rose-500/20 bg-rose-500/[0.05]',
      )}
    >
      {isCorrect ? (
        <CheckCircle2
          size={16}
          className="mt-0.5 shrink-0 text-emerald-500"
          strokeWidth={2}
        />
      ) : isHintCorrect ? (
        <Lightbulb
          size={16}
          className="mt-0.5 shrink-0 text-amber-400"
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
          {result.exercise.vocab.word_type && (
            <WordTypeBadge
              value={result.exercise.vocab.word_type}
              className="h-5 text-xs"
            />
          )}
          <SpeakButton
            text={result.exercise.vocab.word}
            className="-my-1 size-6"
          />
          <span className="text-muted-foreground text-xs">
            — {result.exercise.vocab.meaning}
          </span>
          <GradeBadge level={gradeLevel} />
          {isHintCorrect && (
            <span className="rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] leading-none font-[510] text-amber-400">
              {t('hintNoScore')}
            </span>
          )}
          {pronunciationFailed && (
            <span className="flex items-center gap-1 rounded border border-purple-500/25 bg-purple-500/10 px-1.5 py-0.5 text-[10px] leading-none font-[510] text-purple-300">
              <Mic size={10} />
              {t('pronMissed')}
            </span>
          )}
          {responseMs != null && (
            <span className="text-muted-foreground/60 flex items-center gap-0.5 text-[10px]">
              <Clock size={10} />
              {formatResponseTime(responseMs)}
            </span>
          )}
        </div>
        {!answerCorrect && (
          <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs">
            <span className="text-muted-foreground/70">
              {t('expected')}:{' '}
              <span className="font-[510] text-emerald-500">{expected}</span>
            </span>
            <span className="text-muted-foreground/70">
              {t('yourAnswer')}:{' '}
              {result.userAnswer ? (
                <DiffHighlight expected={expected} actual={result.userAnswer} />
              ) : (
                <span className="text-muted-foreground/50 font-[510]">
                  {t('noAnswer')}
                </span>
              )}
            </span>
          </div>
        )}
        {answerCorrect &&
          result.userAnswer &&
          result.userAnswer.trim().toLowerCase() !==
            expected.trim().toLowerCase() && (
            <p className="text-muted-foreground/70 mt-1 text-xs">
              {t('yourAnswer')}:{' '}
              <span className="font-[510] text-sky-400">
                {result.userAnswer}
              </span>
              <span className="ml-1 opacity-50">— {t('synonymAccepted')}</span>
            </p>
          )}
        {answerCorrect && result.exercise.vocab.synonyms.length > 0 && (
          <p className="text-muted-foreground/45 mt-0.5 text-[11px]">
            {t('alsoAccepted', {
              list: result.exercise.vocab.synonyms.join(', '),
            })}
          </p>
        )}
        {pronunciationFailed && (
          <p className="mt-1 text-[11px] text-purple-300/80">
            {t('pronMissedHint')}
          </p>
        )}
      </div>
    </motion.div>
  )
}
