'use client'

import { motion } from 'framer-motion'
import { Flame, Snowflake, Trophy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Skeleton } from '~/components/ui/skeleton'

import type { UserStreak } from '~/types'

interface StreakCardProps {
  streak: UserStreak | null | undefined
  isLoading: boolean
}

const COUNT_ANIMATION_MS = 700
const MS_PER_DAY = 1000 * 60 * 60 * 24

type StreakStatus = 'active' | 'at-risk' | 'idle'

function todayLocalDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T00:00:00`).getTime()
  const to = new Date(`${toIso}T00:00:00`).getTime()
  return Math.round((to - from) / MS_PER_DAY)
}

function deriveStatus(streak: UserStreak | null | undefined): StreakStatus {
  if (!streak || !streak.last_active_date || streak.current_streak === 0) {
    return 'idle'
  }
  const gap = daysBetween(streak.last_active_date, todayLocalDate())
  if (gap === 0) return 'active'
  if (gap === 1) return 'at-risk'
  if (gap > 1 && gap - 1 <= streak.freezes_remaining) return 'at-risk'
  return 'idle'
}

function useAnimatedCount(target: number): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const startedAt = performance.now()
    const from = 0
    let raf = 0
    const tick = (now: number) => {
      const elapsed = now - startedAt
      const ratio = Math.min(1, elapsed / COUNT_ANIMATION_MS)
      const eased = 1 - Math.pow(1 - ratio, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (ratio < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])

  return value
}

export function StreakCard({ streak, isLoading }: StreakCardProps) {
  const t = useTranslations('Dashboard')
  const current = streak?.current_streak ?? 0
  const longest = streak?.longest_streak ?? 0
  const freezes = streak?.freezes_remaining ?? 0
  const status = deriveStatus(streak)
  const animatedCurrent = useAnimatedCount(current)

  const flameTone =
    status === 'active'
      ? 'text-orange-500'
      : status === 'at-risk'
        ? 'text-amber-500'
        : 'text-muted-foreground'
  const flameBg =
    status === 'active'
      ? 'bg-orange-500/15'
      : status === 'at-risk'
        ? 'bg-amber-500/15'
        : 'bg-muted'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="border-border bg-card relative overflow-hidden rounded-xl border p-6"
    >
      {status === 'active' && current > 0 && (
        <motion.div
          className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-[11px] font-[510] tracking-widest uppercase">
            {t('streakTitle')}
          </p>

          {isLoading ? (
            <div className="mt-2 space-y-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-3 w-44" />
            </div>
          ) : (
            <>
              <div className="mt-1 flex items-baseline gap-1.5">
                <motion.span
                  className={
                    status === 'active'
                      ? 'text-4xl leading-none font-[590] text-orange-500'
                      : 'text-foreground text-4xl leading-none font-[590]'
                  }
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {animatedCurrent.toLocaleString()}
                </motion.span>
                <span className="text-muted-foreground text-lg font-[510]">
                  {t('streakDaysLabel')}
                </span>
              </div>
              <p className="text-muted-foreground mt-1.5 text-sm">
                {t(`streakSubtitle.${status}`, { count: current })}
              </p>
            </>
          )}
        </div>

        <motion.div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${flameBg} ${flameTone}`}
          animate={status === 'active' ? { rotate: [0, 8, -8, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
        >
          <Flame size={18} strokeWidth={1.8} />
        </motion.div>
      </div>

      {!isLoading && (
        <motion.div
          className="mt-5 flex items-center justify-between gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-1.5">
            <Trophy
              size={11}
              className="text-muted-foreground"
              strokeWidth={2}
            />
            <span className="text-muted-foreground text-[10px] font-[510] tracking-wide uppercase">
              {t('streakLongest', { count: longest })}
            </span>
          </div>

          <div
            className="bg-primary/10 text-primary flex items-center gap-1.5 rounded-md px-2 py-1"
            title={t('streakFreezesHint')}
          >
            <Snowflake size={11} strokeWidth={2} />
            <span className="text-[10px] font-[510] tracking-wide uppercase">
              {t('streakFreezes', { count: freezes })}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
