'use client'

import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { EyeOff, Play, Target, Timer, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import { Skeleton } from '~/components/ui/skeleton'
import { useLessons } from '~/hooks/use-lessons'
import { useQuizCandidates } from '~/hooks/use-word-mastery'

import type { ExerciseType, QuizSetup } from '../_types/quiz.types'
import type { ReviewVocab } from '~admin/review/_types/review.types'

// speak-word disabled in quiz: speech recognition isn't reliable enough
// to score mastery fairly. Re-enable once accuracy improves.
const QUIZ_EXERCISE_TYPES: ExerciseType[] = [
  'meaning-to-word',
  'listen-to-word',
  // 'speak-word',
]

const QUIZ_BATCH_LIMIT = 20
const MIN_VOCAB = 1

interface QuizSetupProps {
  onStart: (setup: QuizSetup) => void
}

const CHALLENGE_BADGES = [
  { icon: EyeOff, key: 'noHints' as const },
  { icon: Timer, key: 'timed' as const },
  { icon: Zap, key: 'oneShot' as const },
] as const

export function QuizSetup({ onStart }: QuizSetupProps) {
  const t = useTranslations('Quiz')
  const { user } = useUser()
  const { data: lessons = [] } = useLessons()
  const [selectedLessons, setSelectedLessons] = useState<string[]>([])

  const userId = user?.id ?? ''
  const { data: candidates, isLoading: isVocabLoading } = useQuizCandidates({
    userId,
    lessonIds: selectedLessons,
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
  }))
  const totalCandidates = candidates?.totalCandidates ?? 0

  const toggleLesson = (id: string) => {
    setSelectedLessons((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    )
  }

  const canStart = !isVocabLoading && vocab.length >= MIN_VOCAB

  const handleStart = () => {
    if (!canStart || !user?.id) return
    onStart({
      userId: user.id,
      lessonIds: selectedLessons,
      exerciseTypes: QUIZ_EXERCISE_TYPES,
      vocab,
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

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-2"
      >
        {CHALLENGE_BADGES.map(({ icon: Icon, key }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.06 }}
            className="border-border/60 bg-muted/30 flex items-center gap-1.5 rounded-lg border px-2.5 py-2"
          >
            <Icon size={14} className="text-primary shrink-0" />
            <span className="text-xs font-[510] tracking-tight">
              {t(`challenge.${key}`)}
            </span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="flex flex-col gap-4"
      >
        <div className="space-y-3">
          <Label className="text-xs font-[510] tracking-widest uppercase">
            {t('selectLessons')}
          </Label>
          <div className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
            <label className="hover:bg-accent/40 border-border/50 flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 transition-colors">
              <Checkbox
                checked={selectedLessons.length === 0}
                onCheckedChange={() => setSelectedLessons([])}
              />
              <span className="text-sm font-[510]">{t('allLessons')}</span>
            </label>
            {lessons.map((l) => (
              <label
                key={l.id}
                className="hover:bg-accent/40 border-border/50 flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 transition-colors"
              >
                <Checkbox
                  checked={selectedLessons.includes(l.id)}
                  onCheckedChange={() => toggleLesson(l.id)}
                />
                <span className="text-sm">{l.name}</span>
              </label>
            ))}
          </div>
          <div className="text-muted-foreground text-xs">
            {isVocabLoading ? (
              <Skeleton className="h-3 w-32" />
            ) : totalCandidates > vocab.length ? (
              <>
                {t('batchPrioritized', {
                  batch: vocab.length,
                  total: totalCandidates,
                })}
              </>
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
    </div>
  )
}
