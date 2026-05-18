'use client'

import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Mic, Play, Target } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { useQuizCandidates } from '~/hooks/use-word-mastery'

import { QUIZ_EXERCISE_TYPES } from '../_types/quiz.types'

import { QuizChallengeBadges } from './quiz-challenge-badges'
import { QuizEmptyState } from './quiz-empty-state'

import type { QuizSetup } from '../_types/quiz.types'
import type { ReviewVocab } from '~admin/review/_types/review.types'

const QUIZ_BATCH_LIMIT = 20
const MIN_VOCAB = 1

interface QuizSetupProps {
  onStart: (setup: QuizSetup) => void
}

export function QuizSetup({ onStart }: QuizSetupProps) {
  const t = useTranslations('Quiz')
  const { user } = useUser()

  const userId = user?.id ?? ''
  const { data: candidates, isLoading: isVocabLoading } = useQuizCandidates({
    userId,
    lessonIds: [],
    limit: QUIZ_BATCH_LIMIT,
    enabled: !!userId,
  })

  const vocab: ReviewVocab[] = (candidates?.words ?? []).map((v) => ({
    id: v.id,
    word: v.word,
    meaning: v.meaning,
    word_type: v.word_type,
    phonetic: v.phonetic,
    example: v.example,
    description: v.description,
    synonyms: v.synonyms,
  }))
  const wordLevels: Record<string, number> = Object.fromEntries(
    (candidates?.words ?? []).map((v) => [v.id, v.progress?.level ?? 0]),
  )
  const totalCandidates = candidates?.totalCandidates ?? 0

  const canStart = !isVocabLoading && vocab.length >= MIN_VOCAB
  const isEmpty = !isVocabLoading && totalCandidates === 0

  const handleStart = () => {
    if (!canStart || !user?.id) return
    onStart({
      userId: user.id,
      lessonIds: [],
      exerciseTypes: QUIZ_EXERCISE_TYPES,
      vocab,
      wordLevels,
    })
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-7 pt-4">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-3"
      >
        <motion.div
          animate={{ rotate: [0, -6, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1 }}
          className="bg-primary/10 text-primary rounded-xl p-2.5"
        >
          <Target size={26} strokeWidth={2} />
        </motion.div>
        <div>
          <h1 className="text-foreground text-2xl font-[590] tracking-[-0.5px]">
            {t('setupTitle')}
          </h1>
          <p className="text-muted-foreground text-sm">{t('setupSubtitle')}</p>
        </div>
      </motion.div>

      {isEmpty ? (
        <QuizEmptyState />
      ) : (
        <>
          <QuizChallengeBadges />

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-2 rounded-xl border border-purple-500/20 bg-purple-500/4 px-3 py-2.5"
          >
            <Mic
              size={14}
              className="mt-0.5 shrink-0 text-purple-400"
              strokeWidth={2}
            />
            <p className="text-muted-foreground/90 text-xs leading-snug">
              {t('pronGateHint')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex flex-col gap-4"
          >
            <div className="text-muted-foreground text-center text-xs">
              {isVocabLoading ? (
                <Skeleton className="mx-auto h-3 w-40" />
              ) : totalCandidates > vocab.length ? (
                t('batchPrioritized', {
                  batch: vocab.length,
                  total: totalCandidates,
                })
              ) : (
                <>
                  {t('vocabAvailable', { count: vocab.length })}
                  {!canStart && vocab.length > 0 && (
                    <span className="text-destructive ml-2">
                      — {t('minWarning')}
                    </span>
                  )}
                </>
              )}
            </div>

            <motion.div
              whileHover={canStart ? { scale: 1.01 } : {}}
              whileTap={canStart ? { scale: 0.99 } : {}}
            >
              <Button
                size="lg"
                onClick={handleStart}
                disabled={!canStart}
                className="w-full gap-2"
              >
                <Play size={16} />
                {t('startButton')}
              </Button>
            </motion.div>
          </motion.div>
        </>
      )}
    </div>
  )
}
