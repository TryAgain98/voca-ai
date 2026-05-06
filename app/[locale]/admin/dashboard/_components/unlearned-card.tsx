'use client'

import { motion } from 'framer-motion'
import { ArrowRight, BookOpenCheck, Layers } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { useReviewQuickStartStore } from '~/stores/review-quick-start'

import type { ReviewWord } from '~/types'
import type { ReviewVocab } from '~admin/review/_types/review.types'

interface UnlearnedCardProps {
  unlearnedCount: number
  unlearnedWords: ReviewWord[]
  isLoading: boolean
}

function toReviewVocab(word: ReviewWord): ReviewVocab {
  return {
    id: word.id,
    word: word.word,
    meaning: word.meaning,
    word_type: word.word_type,
    phonetic: word.phonetic,
    example: word.example,
  }
}

const PREVIEW_COUNT = 4

export function UnlearnedCard({
  unlearnedCount,
  unlearnedWords,
  isLoading,
}: UnlearnedCardProps) {
  const t = useTranslations('Dashboard')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const setPendingVocab = useReviewQuickStartStore((s) => s.setPendingVocab)

  const handleStartReview = () => {
    setPendingVocab(unlearnedWords.map(toReviewVocab))
    router.push(`/${locale}/admin/review`)
  }

  const handleViewAll = () => {
    router.push(`/${locale}/admin/dashboard/words?type=unlearned`)
  }

  const isDone = !isLoading && unlearnedCount === 0
  const preview = unlearnedWords.slice(0, PREVIEW_COUNT)
  const remaining = unlearnedCount - PREVIEW_COUNT

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      className="border-border bg-card relative overflow-hidden rounded-xl border p-6"
    >
      {isDone && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-[11px] font-[510] tracking-widest uppercase">
            {t('unlearnedTitle')}
          </p>

          {isLoading ? (
            <div className="mt-2 space-y-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : isDone ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="mt-1 text-4xl leading-none font-[590] text-emerald-500">
                0
              </p>
              <p className="mt-1.5 text-sm font-[510] text-emerald-500">
                {t('unlearnedDone')}
              </p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-foreground mt-1 text-4xl leading-none font-[590]">
                {unlearnedCount.toLocaleString()}
              </p>
              <p className="text-muted-foreground mt-1.5 text-sm">
                {t('unlearnedSubtitle')}
              </p>
            </motion.div>
          )}
        </div>

        <div
          className={`bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isDone ? 'text-emerald-500' : 'text-primary'}`}
        >
          {isDone ? (
            <BookOpenCheck size={18} strokeWidth={1.8} />
          ) : (
            <Layers size={18} strokeWidth={1.8} />
          )}
        </div>
      </div>

      {!isLoading && !isDone && preview.length > 0 && (
        <motion.div
          className="mt-4 space-y-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {preview.map((word, i) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="bg-muted/50 flex items-center gap-2 rounded-lg px-3 py-1.5"
            >
              <span className="text-foreground shrink-0 text-sm font-[510]">
                {word.word}
              </span>
              <span className="text-muted-foreground flex-1 truncate text-right text-xs">
                {word.meaning}
              </span>
            </motion.div>
          ))}
          {remaining > 0 && (
            <p className="text-muted-foreground pt-0.5 pl-1 text-xs">
              {t('andMore', { count: remaining })}
            </p>
          )}
        </motion.div>
      )}

      {!isLoading && !isDone && unlearnedCount >= 4 && (
        <motion.div
          className="mt-4 flex items-center gap-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Button
            size="sm"
            onClick={handleStartReview}
            className="flex-1 gap-2"
          >
            {t('startUnlearned')}
            <ArrowRight size={14} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleViewAll}
            className="shrink-0"
          >
            {t('viewAll')}
          </Button>
        </motion.div>
      )}

      {!isLoading && !isDone && unlearnedCount < 4 && unlearnedCount > 0 && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs">{t('notEnoughWords')}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleViewAll}
            className="shrink-0"
          >
            {t('viewAll')}
          </Button>
        </div>
      )}
    </motion.div>
  )
}
