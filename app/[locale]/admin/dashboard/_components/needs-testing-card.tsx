'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Stethoscope } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { dayjs } from '~/lib/dayjs'
import { useQuizQuickStartStore } from '~/stores/quiz-quick-start'

import type { ReviewWord } from '~/types'
import type { ReviewVocab } from '~admin/review/_types/review.types'

interface NeedsTestingCardProps {
  needsTestingCount: number
  needsTestingWords: ReviewWord[]
  isLoading: boolean
}

const PREVIEW_COUNT = 5
const MIN_TEST_WORDS = 1

function toReviewVocab(word: ReviewWord): ReviewVocab {
  return {
    id: word.id,
    word: word.word,
    meaning: word.meaning,
    word_type: word.word_type,
    phonetic: word.phonetic,
    example: word.example,
    synonyms: word.synonyms,
  }
}

function getDaysOverdue(word: ReviewWord, now: Date): number {
  const dueAt = word.progress?.due_at
  if (!dueAt) return 0
  return Math.max(0, dayjs(now).diff(dayjs(dueAt), 'day'))
}

export function NeedsTestingCard({
  needsTestingCount,
  needsTestingWords,
  isLoading,
}: NeedsTestingCardProps) {
  const t = useTranslations('Dashboard')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const setPendingVocab = useQuizQuickStartStore((s) => s.setPendingVocab)

  const isDone = !isLoading && needsTestingCount === 0
  const canStart = needsTestingCount >= MIN_TEST_WORDS
  const preview = needsTestingWords.slice(0, PREVIEW_COUNT)
  const remaining = needsTestingCount - PREVIEW_COUNT
  const now = dayjs().toDate()

  const handleStartTest = () => {
    setPendingVocab(needsTestingWords.map(toReviewVocab))
    router.push(`/${locale}/admin/quiz`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
      className="border-border bg-card relative overflow-hidden rounded-xl border p-6"
    >
      {!isLoading && !isDone && (
        <motion.div
          className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-[11px] font-[510] tracking-widest uppercase">
              {t('needsTestingTitle')}
            </p>
            {!isLoading && !isDone && (
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Badge
                  variant="secondary"
                  className="h-4 border-0 bg-orange-500/15 px-1.5 py-0 text-[10px] text-orange-500"
                >
                  {needsTestingCount}
                </Badge>
              </motion.div>
            )}
          </div>

          {isLoading ? (
            <div className="mt-2 space-y-2">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-4 w-56" />
            </div>
          ) : isDone ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="mt-1 text-3xl leading-none font-[590] text-emerald-500">
                {t('needsTestingDone')}
              </p>
              <p className="text-muted-foreground mt-1.5 text-sm">
                {t('needsTestingDoneSubtitle')}
              </p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-foreground mt-1 text-base leading-snug font-[510]">
                {t('needsTestingHero')}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('needsTestingSubtitle')}
              </p>
            </motion.div>
          )}
        </div>

        <motion.div
          className={
            isDone
              ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500'
              : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-500'
          }
          animate={isDone ? { rotate: [0, 8, -8, 0] } : { y: [0, -2, 0, 2, 0] }}
          transition={
            isDone
              ? { duration: 2, repeat: Infinity, repeatDelay: 2 }
              : { duration: 3, repeat: Infinity }
          }
        >
          {isDone ? (
            <ShieldCheck size={18} strokeWidth={1.8} />
          ) : (
            <Stethoscope size={18} strokeWidth={1.8} />
          )}
        </motion.div>
      </div>

      {!isLoading && !isDone && preview.length > 0 && (
        <motion.div
          className="relative mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          {preview.map((word, i) => {
            const daysOverdue = getDaysOverdue(word, now)
            return (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.04 }}
                className="bg-muted/40 flex items-center gap-2 rounded-lg px-3 py-2"
              >
                <span className="text-foreground shrink-0 text-sm font-[510]">
                  {word.word}
                </span>
                <span className="text-muted-foreground flex-1 truncate text-xs">
                  {word.meaning}
                </span>
                {daysOverdue > 0 && (
                  <Badge
                    variant="secondary"
                    className="h-5 shrink-0 border-0 bg-orange-500/10 px-1.5 text-[10px] text-orange-500"
                  >
                    +{daysOverdue}d
                  </Badge>
                )}
              </motion.div>
            )
          })}
          {remaining > 0 && (
            <p className="text-muted-foreground col-span-full pt-0.5 pl-1 text-xs">
              {t('andMore', { count: remaining })}
            </p>
          )}
        </motion.div>
      )}

      {!isLoading && !isDone && canStart && (
        <motion.div
          className="relative mt-4"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.005 }}
        >
          <Button
            size="sm"
            onClick={handleStartTest}
            className="w-full gap-2 bg-orange-500 text-white hover:bg-orange-600"
          >
            {t('startTestNow')}
            <ArrowRight size={14} />
          </Button>
        </motion.div>
      )}

      {!isLoading && !isDone && !canStart && (
        <p className="text-muted-foreground relative mt-3 text-xs">
          {t('notEnoughTestable', { min: MIN_TEST_WORDS })}
        </p>
      )}
    </motion.div>
  )
}
