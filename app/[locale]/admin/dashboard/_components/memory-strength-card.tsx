'use client'

import { motion } from 'framer-motion'
import { Activity, Flame, ShieldAlert } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Skeleton } from '~/components/ui/skeleton'

interface MemoryStrengthCardProps {
  averageRetention: number
  fadingCount: number
  relearningCount: number
  isLoading: boolean
}

const RING_RADIUS = 32
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
const STRENGTH_ANIMATION_MS = 900
const STRONG_THRESHOLD = 0.92
const FADING_THRESHOLD = 0.85

function getTier(retention: number): 'strong' | 'fading' | 'risk' {
  if (retention >= STRONG_THRESHOLD) return 'strong'
  if (retention >= FADING_THRESHOLD) return 'fading'
  return 'risk'
}

function useEasedRatio(target: number): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const startedAt = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const elapsed = now - startedAt
      const ratio = Math.min(1, elapsed / STRENGTH_ANIMATION_MS)
      const eased = 1 - Math.pow(1 - ratio, 3)
      setValue(target * eased)
      if (ratio < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])

  return value
}

export function MemoryStrengthCard({
  averageRetention,
  fadingCount,
  relearningCount,
  isLoading,
}: MemoryStrengthCardProps) {
  const t = useTranslations('Dashboard.memoryStrength')
  const animated = useEasedRatio(averageRetention)
  const percent = Math.round(animated * 100)
  const tier = getTier(averageRetention)

  const tierColor =
    tier === 'strong'
      ? 'text-emerald-500'
      : tier === 'fading'
        ? 'text-amber-500'
        : 'text-rose-500'
  const tierGlow =
    tier === 'strong'
      ? 'bg-emerald-500/12'
      : tier === 'fading'
        ? 'bg-amber-500/15'
        : 'bg-rose-500/15'
  const ringStroke =
    tier === 'strong' ? '#10b981' : tier === 'fading' ? '#f59e0b' : '#f43f5e'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="border-border bg-card relative overflow-hidden rounded-xl border p-6"
    >
      <motion.div
        className={`pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl ${tierGlow}`}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative flex items-start gap-5">
        <div className="relative shrink-0">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r={RING_RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
            />
            <motion.circle
              cx="40"
              cy="40"
              r={RING_RADIUS}
              fill="none"
              stroke={ringStroke}
              strokeWidth="6"
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
              strokeDasharray={RING_CIRCUMFERENCE}
              initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
              animate={{
                strokeDashoffset:
                  RING_CIRCUMFERENCE * (1 - Math.min(1, averageRetention)),
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-[590] ${tierColor}`}>
              {isLoading ? '—' : `${percent}%`}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-[11px] font-[510] tracking-widest uppercase">
              {t('title')}
            </p>
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 1.5 }}
            >
              <Activity size={12} className={tierColor} />
            </motion.div>
          </div>

          {isLoading ? (
            <div className="mt-2 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
          ) : (
            <>
              <p className="text-foreground mt-1 text-base font-[590] tracking-[-0.3px]">
                {t(`tier.${tier}`)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                {t(`hint.${tier}`)}
              </p>
            </>
          )}

          {!isLoading && (relearningCount > 0 || fadingCount > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-3 flex flex-wrap items-center gap-3 text-xs"
            >
              {relearningCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 px-2.5 py-1 text-rose-500">
                  <Flame size={11} />
                  {t('relearningBadge', { count: relearningCount })}
                </span>
              )}
              {fadingCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 px-2.5 py-1 text-amber-500">
                  <ShieldAlert size={11} />
                  {t('fadingBadge', { count: fadingCount })}
                </span>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
