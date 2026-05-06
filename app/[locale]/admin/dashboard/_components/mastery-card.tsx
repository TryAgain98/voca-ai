'use client'

import { motion } from 'framer-motion'
import { Award, Brain, Lock, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Skeleton } from '~/components/ui/skeleton'

interface MasteryCardProps {
  totalWords: number
  masteredCount: number
  practicingCount: number
  isLoading: boolean
}

const COUNT_ANIMATION_MS = 700

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

export function MasteryCard({
  totalWords,
  masteredCount,
  practicingCount,
  isLoading,
}: MasteryCardProps) {
  const t = useTranslations('Dashboard')

  const animatedMastered = useAnimatedCount(masteredCount)
  const safeTotal = Math.max(totalWords, 1)
  const masteredRatio = masteredCount / safeTotal
  const practicingRatio = practicingCount / safeTotal
  const untouchedRatio = Math.max(0, 1 - masteredRatio - practicingRatio)

  const masteredPercent = Math.round(masteredRatio * 100)
  const isPerfect = masteredCount === totalWords && totalWords > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="border-border bg-card relative overflow-hidden rounded-xl border p-6"
    >
      {isPerfect && (
        <>
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent"
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </>
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-[11px] font-[510] tracking-widest uppercase">
              {t('masteryTitle')}
            </p>
            {isPerfect && (
              <motion.div
                animate={{ rotate: [0, 14, -14, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                <Sparkles size={12} className="text-amber-500" />
              </motion.div>
            )}
          </div>

          {isLoading ? (
            <div className="mt-2 space-y-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-3 w-44" />
            </div>
          ) : (
            <>
              <div className="mt-1 flex items-baseline gap-1.5">
                <motion.span
                  className={
                    isPerfect
                      ? 'text-4xl leading-none font-[590] text-amber-500'
                      : 'text-foreground text-4xl leading-none font-[590]'
                  }
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {animatedMastered.toLocaleString()}
                </motion.span>
                <span className="text-muted-foreground text-lg font-[510]">
                  / {totalWords.toLocaleString()}
                </span>
              </div>
              <p className="text-muted-foreground mt-1.5 text-sm">
                {t('masterySubtitle', { percent: masteredPercent })}
              </p>
            </>
          )}
        </div>

        <motion.div
          className={
            isPerfect
              ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500'
              : 'bg-muted text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'
          }
          animate={isPerfect ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
        >
          <Award size={18} strokeWidth={1.8} />
        </motion.div>
      </div>

      {!isLoading && totalWords > 0 && (
        <motion.div
          className="mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <div className="bg-muted relative flex h-2 overflow-hidden rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${masteredRatio * 100}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className={
                isPerfect
                  ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
              }
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${practicingRatio * 100}%` }}
              transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
              className="bg-primary/70"
            />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <Legend
              icon={Award}
              colorClass={isPerfect ? 'text-amber-500' : 'text-emerald-500'}
              label={t('legendMastered')}
              count={masteredCount}
              ratio={masteredRatio}
              delay={0.3}
            />
            <Legend
              icon={Brain}
              colorClass="text-primary"
              label={t('legendPracticing')}
              count={practicingCount}
              ratio={practicingRatio}
              delay={0.36}
            />
            <Legend
              icon={Lock}
              colorClass="text-muted-foreground"
              label={t('legendUntouched')}
              count={Math.round(untouchedRatio * totalWords)}
              ratio={untouchedRatio}
              delay={0.42}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

interface LegendProps {
  icon: typeof Award
  colorClass: string
  label: string
  count: number
  ratio: number
  delay: number
}

function Legend({
  icon: Icon,
  colorClass,
  label,
  count,
  ratio,
  delay,
}: LegendProps) {
  const animated = useAnimatedCount(count)
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex flex-col gap-0.5"
    >
      <div className="flex items-center gap-1.5">
        <Icon size={11} className={colorClass} strokeWidth={2} />
        <span className="text-muted-foreground text-[10px] font-[510] tracking-wide uppercase">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-foreground text-base font-[590]">{animated}</span>
        <span className="text-muted-foreground text-xs">
          ({Math.round(ratio * 100)}%)
        </span>
      </div>
    </motion.div>
  )
}
