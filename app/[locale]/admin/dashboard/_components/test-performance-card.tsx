'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Target, TrendingDown, TrendingUp } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'

interface TestPerformanceCardProps {
  recentAverage: number
  sessionsThisWeek: number
  recentScores: number[]
  totalSessions: number
  isLoading: boolean
}

const SPARK_HEIGHT = 32
const SPARK_WIDTH = 120
const SCORE_COLOR_HIGH = 'text-emerald-500'
const SCORE_COLOR_MID = 'text-primary'
const SCORE_COLOR_LOW = 'text-orange-500'

function getScoreColor(score: number): string {
  if (score >= 0.8) return SCORE_COLOR_HIGH
  if (score >= 0.5) return SCORE_COLOR_MID
  return SCORE_COLOR_LOW
}

function buildSparkPath(scores: number[]): string {
  if (scores.length < 2) return ''
  const stepX = SPARK_WIDTH / (scores.length - 1)
  return scores
    .map((s, i) => {
      const x = i * stepX
      const y = SPARK_HEIGHT - s * SPARK_HEIGHT
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

export function TestPerformanceCard({
  recentAverage,
  sessionsThisWeek,
  recentScores,
  totalSessions,
  isLoading,
}: TestPerformanceCardProps) {
  const t = useTranslations('Dashboard')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const isEmpty = !isLoading && totalSessions === 0
  const percent = Math.round(recentAverage * 100)
  const scoreColor = getScoreColor(recentAverage)
  const isImproving =
    recentScores.length >= 2 &&
    recentScores[recentScores.length - 1] > recentScores[0]
  const TrendIcon = isImproving ? TrendingUp : TrendingDown
  const sparkPath = buildSparkPath(recentScores)

  const handleViewHistory = () => {
    router.push(`/${locale}/admin/quiz/history`)
  }

  const handleStartQuiz = () => {
    router.push(`/${locale}/admin/quiz`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
      className="border-border bg-card relative overflow-hidden rounded-xl border p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-[11px] font-[510] tracking-widest uppercase">
            {t('testPerformanceTitle')}
          </p>

          {isLoading ? (
            <div className="mt-2 space-y-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ) : isEmpty ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-muted-foreground mt-1 text-4xl leading-none font-[590]">
                —
              </p>
              <p className="text-muted-foreground mt-1.5 text-sm">
                {t('testPerformanceEmpty')}
              </p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span
                  className={`text-4xl leading-none font-[590] ${scoreColor}`}
                >
                  {percent}
                </span>
                <span className="text-muted-foreground text-lg font-[510]">
                  %
                </span>
              </div>
              <p className="text-muted-foreground mt-1.5 text-sm">
                {t('testPerformanceSubtitle', { count: sessionsThisWeek })}
              </p>
            </motion.div>
          )}
        </div>

        <div
          className={`bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            isEmpty ? 'text-muted-foreground' : scoreColor
          }`}
        >
          <Target size={18} strokeWidth={1.8} />
        </div>
      </div>

      {!isLoading && !isEmpty && recentScores.length >= 2 && (
        <motion.div
          className="mt-4 flex items-center justify-between gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <svg
            width={SPARK_WIDTH}
            height={SPARK_HEIGHT}
            viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
            className="overflow-visible"
            aria-hidden
          >
            <motion.path
              d={sparkPath}
              fill="none"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={scoreColor}
              stroke="currentColor"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            />
          </svg>
          <div
            className={`flex items-center gap-1 text-xs font-[510] ${
              isImproving ? 'text-emerald-500' : 'text-orange-500'
            }`}
          >
            <TrendIcon size={12} />
            <span>
              {t(isImproving ? 'trendUp' : 'trendDown', {
                count: recentScores.length,
              })}
            </span>
          </div>
        </motion.div>
      )}

      <motion.div
        className="mt-4 flex items-center gap-2"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          size="sm"
          onClick={handleStartQuiz}
          className="flex-1 gap-2"
          disabled={isLoading}
        >
          {t(isEmpty ? 'startQuiz' : 'takeAnotherQuiz')}
          <ArrowRight size={14} />
        </Button>
        {!isEmpty && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleViewHistory}
            className="shrink-0"
          >
            {t('viewHistory')}
          </Button>
        )}
      </motion.div>
    </motion.div>
  )
}
