'use client'

import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Stethoscope,
  Wand2,
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { useQuizQuickStartStore } from '~/stores/quiz-quick-start'
import { useReviewQuickStartStore } from '~/stores/review-quick-start'

import type { ReviewWord } from '~/types'
import type { ReviewVocab } from '~admin/review/_types/review.types'

const HERO_BATCH_LIMIT = 20
const MIN_BATCH = 1

type Track = 'test' | 'review' | 'learn' | 'celebrate'

interface SmartHeroCardProps {
  needsTestingCount: number
  needsTestingWords: ReviewWord[]
  dueTodayCount: number
  dueTodayWords: ReviewWord[]
  unlearnedCount: number
  unlearnedWords: ReviewWord[]
  masteredCount: number
  totalWords: number
  isLoading: boolean
}

interface PhaseConfig {
  track: Track
  icon: typeof Stethoscope
  accent: string
  glow: string
  iconAnim: 'pulse' | 'wiggle' | 'shimmer'
  ctaClass: string
}

const PHASE_CONFIG: Record<Track, PhaseConfig> = {
  review: {
    track: 'review',
    icon: BookOpen,
    accent: 'text-primary',
    glow: 'bg-primary/15',
    iconAnim: 'wiggle',
    ctaClass: '',
  },
  test: {
    track: 'test',
    icon: Stethoscope,
    accent: 'text-orange-500',
    glow: 'bg-orange-500/15',
    iconAnim: 'pulse',
    ctaClass: 'bg-orange-500 hover:bg-orange-600 text-white',
  },
  learn: {
    track: 'learn',
    icon: Wand2,
    accent: 'text-sky-500',
    glow: 'bg-sky-500/15',
    iconAnim: 'shimmer',
    ctaClass: 'bg-sky-500 hover:bg-sky-600 text-white',
  },
  celebrate: {
    track: 'celebrate',
    icon: Sparkles,
    accent: 'text-emerald-500',
    glow: 'bg-emerald-500/15',
    iconAnim: 'wiggle',
    ctaClass: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  },
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

function getIconMotion(anim: PhaseConfig['iconAnim']) {
  if (anim === 'pulse') return { scale: [1, 1.08, 1] }
  if (anim === 'wiggle') return { rotate: [0, -8, 8, 0] }
  return { rotate: [0, 14, -14, 0] }
}

interface PhaseProps {
  track: Track
  total: number
  batch: number
  onCta: () => void
  size: 'large' | 'compact'
}

function Phase({ track, total, batch, onCta, size }: PhaseProps) {
  const t = useTranslations('Dashboard.hero')
  const cfg = PHASE_CONFIG[track]
  const Icon = cfg.icon
  const queued = Math.max(0, total - batch)
  const isCompact = size === 'compact'

  return (
    <div
      className={
        isCompact
          ? 'relative flex items-center justify-between gap-4 py-4'
          : 'relative flex items-start justify-between gap-6'
      }
    >
      <div className="min-w-0 flex-1">
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-[590] tracking-widest uppercase ${cfg.accent}`}
          style={{
            borderColor: 'currentColor',
            backgroundColor: 'transparent',
          }}
        >
          <span className="relative inline-flex h-1.5 w-1.5">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${cfg.accent}`}
              style={{ backgroundColor: 'currentColor' }}
            />
            <span
              className={`relative inline-flex h-1.5 w-1.5 rounded-full ${cfg.accent}`}
              style={{ backgroundColor: 'currentColor' }}
            />
          </span>
          {t(`badge.${track}`)}
        </motion.span>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1"
        >
          <h2
            className={
              isCompact
                ? 'text-foreground text-xl leading-tight font-[590] tracking-[-0.5px]'
                : 'text-foreground text-2xl leading-tight font-[590] tracking-[-0.5px] sm:text-3xl'
            }
          >
            {t(`title.${track}`, { count: batch })}
          </h2>
          {queued > 0 && (
            <span className="text-muted-foreground/80 text-xs font-[510] tracking-wide">
              {t('queueTail', { count: queued })}
            </span>
          )}
        </motion.div>

        {!isCompact && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18 }}
            className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed"
          >
            {t(`subtitle.${track}`)}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className={isCompact ? 'mt-3' : 'mt-5'}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block"
          >
            <Button
              size={isCompact ? 'sm' : 'lg'}
              onClick={onCta}
              className={`gap-2 ${isCompact ? 'px-4' : 'px-5'} ${cfg.ctaClass}`}
            >
              {t(`cta.${track}`, { count: batch })}
              <ArrowRight size={isCompact ? 14 : 16} />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        animate={getIconMotion(cfg.iconAnim)}
        transition={{
          duration: cfg.iconAnim === 'pulse' ? 1.6 : 2.2,
          repeat: Infinity,
          repeatDelay: cfg.iconAnim === 'pulse' ? 0 : 1.8,
        }}
        className={`flex shrink-0 items-center justify-center rounded-2xl ${cfg.glow} ${cfg.accent} ${
          isCompact ? 'h-11 w-11' : 'h-14 w-14'
        }`}
      >
        <Icon size={isCompact ? 22 : 28} strokeWidth={1.7} />
      </motion.div>
    </div>
  )
}

export function SmartHeroCard(props: SmartHeroCardProps) {
  const t = useTranslations('Dashboard.hero')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const setPendingQuiz = useQuizQuickStartStore((s) => s.setPendingVocab)
  const setPendingReview = useReviewQuickStartStore((s) => s.setPendingVocab)

  if (props.isLoading) {
    return (
      <div className="border-border bg-card relative h-[210px] overflow-hidden rounded-2xl border p-7">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-12 w-40" />
        <Skeleton className="mt-3 h-4 w-72" />
        <Skeleton className="mt-6 h-10 w-56" />
      </div>
    )
  }

  const hasReview = props.dueTodayCount >= MIN_BATCH
  const hasTest = props.needsTestingCount >= MIN_BATCH
  const hasLearn = props.unlearnedCount >= MIN_BATCH

  const handleReview = () => {
    setPendingReview(
      props.dueTodayWords.slice(0, HERO_BATCH_LIMIT).map(toReviewVocab),
    )
    router.push(`/${locale}/admin/review`)
  }
  const handleTest = () => {
    setPendingQuiz(
      props.needsTestingWords.slice(0, HERO_BATCH_LIMIT).map(toReviewVocab),
    )
    router.push(`/${locale}/admin/quiz`)
  }
  const handleLearn = () => {
    setPendingReview(
      props.unlearnedWords.slice(0, HERO_BATCH_LIMIT).map(toReviewVocab),
    )
    router.push(`/${locale}/admin/review`)
  }
  const handleCelebrate = () => router.push(`/${locale}/admin/quiz`)

  // Dual track: surface BOTH review and test so user can prep then verify
  if (hasReview && hasTest) {
    const reviewBatch = Math.min(props.dueTodayCount, HERO_BATCH_LIMIT)
    const testBatch = Math.min(props.needsTestingCount, HERO_BATCH_LIMIT)
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="border-border bg-card relative overflow-hidden rounded-2xl border px-7 py-5"
      >
        <motion.div
          className="bg-primary/12 pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-orange-500/12 blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.4 }}
        />

        <div className="relative">
          <p className="text-muted-foreground text-[10px] font-[590] tracking-widest uppercase">
            {t('dailyPlanTitle')}
          </p>
          <p className="text-muted-foreground/80 mt-0.5 text-xs">
            {t('dailyPlanHint')}
          </p>
        </div>

        <Phase
          track="review"
          total={props.dueTodayCount}
          batch={reviewBatch}
          onCta={handleReview}
          size="compact"
        />
        <div className="border-border/40 border-t" />
        <Phase
          track="test"
          total={props.needsTestingCount}
          batch={testBatch}
          onCta={handleTest}
          size="compact"
        />
      </motion.div>
    )
  }

  const track: Track = hasTest
    ? 'test'
    : hasReview
      ? 'review'
      : hasLearn
        ? 'learn'
        : 'celebrate'

  const total =
    track === 'test'
      ? props.needsTestingCount
      : track === 'review'
        ? props.dueTodayCount
        : track === 'learn'
          ? props.unlearnedCount
          : props.masteredCount

  const batch =
    track === 'celebrate' ? total : Math.min(total, HERO_BATCH_LIMIT)
  const onCta =
    track === 'test'
      ? handleTest
      : track === 'review'
        ? handleReview
        : track === 'learn'
          ? handleLearn
          : handleCelebrate

  const cfg = PHASE_CONFIG[track]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="border-border bg-card relative overflow-hidden rounded-2xl border p-7"
    >
      <motion.div
        className={`pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full blur-3xl ${cfg.glow}`}
        animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0.95, 0.6] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className={`pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full blur-3xl ${cfg.glow}`}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
      />
      <Phase
        track={track}
        total={total}
        batch={batch}
        onCta={onCta}
        size="large"
      />
    </motion.div>
  )
}
