'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, Sparkles } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { useReviewQuickStartStore } from '~/stores/review-quick-start'

import type { TrickyWord } from '~/services/quiz-session.service'
import type { ReviewVocab } from '~admin/review/_types/review.types'

interface TrickyWordsCardProps {
  trickyWords: TrickyWord[]
  totalSessions: number
  isLoading: boolean
}

const MIN_REVIEW_WORDS = 1

function toReviewVocab(word: TrickyWord): ReviewVocab {
  return {
    id: word.word_id,
    word: word.word,
    meaning: word.meaning,
    word_type: word.word_type,
    phonetic: word.phonetic,
    example: word.example,
  }
}

export function TrickyWordsCard({
  trickyWords,
  totalSessions,
  isLoading,
}: TrickyWordsCardProps) {
  const t = useTranslations('Dashboard')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const setPendingVocab = useReviewQuickStartStore((s) => s.setPendingVocab)

  const isEmpty = !isLoading && trickyWords.length === 0
  const hasNoSessions = totalSessions === 0
  const canReview = trickyWords.length >= MIN_REVIEW_WORDS

  const handleReviewTricky = () => {
    setPendingVocab(trickyWords.map(toReviewVocab))
    router.push(`/${locale}/admin/review`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
      className="border-border bg-card relative overflow-hidden rounded-xl border p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-[11px] font-[510] tracking-widest uppercase">
              {t('trickyWordsTitle')}
            </p>
            {!isLoading && !isEmpty && (
              <Badge
                variant="secondary"
                className="h-4 border-0 bg-orange-500/10 px-1.5 py-0 text-[10px] text-orange-500"
              >
                {trickyWords.length}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {hasNoSessions
              ? t('trickyWordsHintNoSessions')
              : isEmpty
                ? t('trickyWordsHintAllCorrect')
                : t('trickyWordsHint')}
          </p>
        </div>

        <div
          className={`bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            isEmpty ? 'text-emerald-500' : 'text-orange-500'
          }`}
        >
          {isEmpty ? (
            <Sparkles size={18} strokeWidth={1.8} />
          ) : (
            <AlertTriangle size={18} strokeWidth={1.8} />
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : !isEmpty ? (
        <motion.div
          className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {trickyWords.map((word, i) => (
            <motion.div
              key={word.word_id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.04 }}
              className="bg-muted/50 flex items-center gap-2 rounded-lg px-3 py-2"
            >
              <span className="text-foreground shrink-0 text-sm font-[510]">
                {word.word}
              </span>
              <span className="text-muted-foreground flex-1 truncate text-xs">
                {word.meaning}
              </span>
              <Badge
                variant="secondary"
                className="h-5 shrink-0 border-0 bg-orange-500/10 px-1.5 text-[10px] text-orange-500"
              >
                ×{word.wrongCount}
              </Badge>
            </motion.div>
          ))}
        </motion.div>
      ) : null}

      {!isLoading && canReview && (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Button
            size="sm"
            onClick={handleReviewTricky}
            className="w-full gap-2"
          >
            {t('reviewTrickyNow')}
            <ArrowRight size={14} />
          </Button>
        </motion.div>
      )}

      {!isLoading && !isEmpty && !canReview && (
        <p className="text-muted-foreground mt-3 text-xs">
          {t('notEnoughTricky', { min: MIN_REVIEW_WORDS })}
        </p>
      )}
    </motion.div>
  )
}
