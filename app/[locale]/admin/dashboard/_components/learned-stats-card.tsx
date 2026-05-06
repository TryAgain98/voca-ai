'use client'

import { motion } from 'framer-motion'
import {
  Award,
  BookOpen,
  Flame,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Skeleton } from '~/components/ui/skeleton'

interface LearnedStatsCardProps {
  totalWords: number
  learnedCount: number
  isLoading: boolean
}

function getAchievementConfig(percent: number) {
  if (percent >= 100)
    return {
      icon: Sparkles,
      color: 'text-amber-500',
      darkGlow: 'dark:shadow-[0_0_32px_rgba(245,158,11,0.18)]',
      barColor: 'bg-amber-500',
      overlayClass: 'from-amber-500/5',
      key: 'perfect' as const,
    }
  if (percent >= 80)
    return {
      icon: Star,
      color: 'text-emerald-500',
      darkGlow: 'dark:shadow-[0_0_24px_rgba(16,185,129,0.15)]',
      barColor: 'bg-emerald-500',
      overlayClass: null,
      key: 'great' as const,
    }
  if (percent >= 50)
    return {
      icon: TrendingUp,
      color: 'text-primary',
      darkGlow: '',
      barColor: 'bg-primary',
      overlayClass: null,
      key: 'halfway' as const,
    }
  if (percent >= 20)
    return {
      icon: Flame,
      color: 'text-orange-500',
      darkGlow: '',
      barColor: 'bg-orange-500',
      overlayClass: null,
      key: 'started' as const,
    }
  return {
    icon: BookOpen,
    color: 'text-muted-foreground',
    darkGlow: '',
    barColor: 'bg-primary',
    overlayClass: null,
    key: 'fresh' as const,
  }
}

export function LearnedStatsCard({
  totalWords,
  learnedCount,
  isLoading,
}: LearnedStatsCardProps) {
  const t = useTranslations('Dashboard')
  const percent =
    totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0
  const config = getAchievementConfig(percent)
  const AchievementIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`border-border bg-card relative overflow-hidden rounded-xl border p-6 ${config.darkGlow}`}
    >
      {percent >= 100 && config.overlayClass && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${config.overlayClass} to-transparent`}
          />
        </motion.div>
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-[11px] font-[510] tracking-widest uppercase">
            {t('learnedTitle')}
          </p>

          {isLoading ? (
            <div className="mt-2 space-y-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-foreground text-4xl leading-none font-[590]">
                  {learnedCount.toLocaleString()}
                </span>
                <span className="text-muted-foreground text-lg font-[510]">
                  / {totalWords.toLocaleString()}
                </span>
              </div>
              <p className={`mt-1.5 text-sm font-[510] ${config.color}`}>
                {t(`achievement.${config.key}`)}
              </p>
            </motion.div>
          )}
        </div>

        <motion.div
          className={`bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.color}`}
          animate={percent >= 100 ? { rotate: [0, 8, -8, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <AchievementIcon size={18} strokeWidth={1.8} />
        </motion.div>
      </div>

      {!isLoading && totalWords > 0 && (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-muted-foreground mb-1.5 flex justify-between text-xs">
            <span>{t('progress')}</span>
            <span className={config.color}>{percent}%</span>
          </div>
          <div className="bg-muted h-1.5 overflow-hidden rounded-full">
            <motion.div
              className={`h-full rounded-full ${config.barColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      )}

      {percent >= 80 && percent < 100 && (
        <motion.div
          className="mt-3 flex items-center gap-1.5 text-xs text-emerald-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Award size={12} />
          <span>{t('almostDone', { left: totalWords - learnedCount })}</span>
        </motion.div>
      )}
    </motion.div>
  )
}
