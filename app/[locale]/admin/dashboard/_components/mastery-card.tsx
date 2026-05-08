'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Award, Brain, Lock, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
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
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const animatedMastered = useAnimatedCount(masteredCount)
  const safeTotal = Math.max(totalWords, 1)
  const masteredRatio = masteredCount / safeTotal
  const practicingRatio = practicingCount / safeTotal
  const untouchedRatio = Math.max(0, 1 - masteredRatio - practicingRatio)

  const masteredPercent = Math.round(masteredRatio * 100)
  const isPerfect = masteredCount === totalWords && totalWords > 0

  const goToTab = (tab: 'mastered' | 'practicing' | 'untouched') => {
    router.push(`/${locale}/admin/dashboard/words?tab=${tab}`)
  }

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

        <div className="flex shrink-0 flex-col items-end gap-2">
          <Link
            href={`/${locale}/admin/dashboard/words`}
            className="text-primary hover:text-primary/80 group inline-flex items-center gap-1 text-[11px] font-[510] tracking-widest uppercase transition-colors"
          >
            {t('viewLibrary')}
            <ArrowUpRight
              size={12}
              strokeWidth={2.4}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
          <motion.div
            className={
              isPerfect
                ? 'flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500'
                : 'bg-muted text-primary flex h-10 w-10 items-center justify-center rounded-lg'
            }
            animate={isPerfect ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          >
            <Award size={18} strokeWidth={1.8} />
          </motion.div>
        </div>
      </div>

      {!isLoading && totalWords > 0 && (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <div className="bg-muted relative flex h-1.5 overflow-hidden rounded-full">
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
              accent={isPerfect ? 'amber' : 'emerald'}
              label={t('legendMastered')}
              count={masteredCount}
              ratio={masteredRatio}
              delay={0.3}
              onClick={() => goToTab('mastered')}
            />
            <Legend
              icon={Brain}
              accent="primary"
              label={t('legendPracticing')}
              count={practicingCount}
              ratio={practicingRatio}
              delay={0.36}
              onClick={() => goToTab('practicing')}
            />
            <Legend
              icon={Lock}
              accent="muted"
              label={t('legendUntouched')}
              count={Math.round(untouchedRatio * totalWords)}
              ratio={untouchedRatio}
              delay={0.42}
              onClick={() => goToTab('untouched')}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

type LegendAccent = 'emerald' | 'primary' | 'muted' | 'amber'

interface AccentClasses {
  text: string
  hoverBg: string
  hoverBorder: string
  shadow: string
  glow: string
}

const LEGEND_ACCENT: Record<LegendAccent, AccentClasses> = {
  emerald: {
    text: 'text-emerald-500',
    hoverBg: 'group-hover:bg-emerald-500/[0.05]',
    hoverBorder: 'group-hover:border-emerald-500/30',
    shadow: 'group-hover:shadow-emerald-500/25',
    glow: 'bg-emerald-500/15',
  },
  primary: {
    text: 'text-primary',
    hoverBg: 'group-hover:bg-primary/[0.06]',
    hoverBorder: 'group-hover:border-primary/30',
    shadow: 'group-hover:shadow-primary/25',
    glow: 'bg-primary/15',
  },
  muted: {
    text: 'text-muted-foreground',
    hoverBg: 'group-hover:bg-white/[0.05]',
    hoverBorder: 'group-hover:border-white/[0.18]',
    shadow: 'group-hover:shadow-black/30',
    glow: 'bg-white/10',
  },
  amber: {
    text: 'text-amber-500',
    hoverBg: 'group-hover:bg-amber-500/[0.05]',
    hoverBorder: 'group-hover:border-amber-500/30',
    shadow: 'group-hover:shadow-amber-500/25',
    glow: 'bg-amber-500/15',
  },
}

interface LegendProps {
  icon: typeof Award
  accent: LegendAccent
  label: string
  count: number
  ratio: number
  delay: number
  onClick: () => void
}

function Legend({
  icon: Icon,
  accent,
  label,
  count,
  ratio,
  delay,
  onClick,
}: LegendProps) {
  const animated = useAnimatedCount(count)
  const a = LEGEND_ACCENT[accent]
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97, y: 0 }}
      onClick={onClick}
      className={`group focus-visible:ring-ring relative flex cursor-pointer flex-col gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-left shadow-[0_0_0_0_rgba(0,0,0,0)] transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:shadow-lg ${a.hoverBg} ${a.hoverBorder} ${a.shadow} focus-visible:ring-2 focus-visible:outline-none`}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute -inset-px rounded-lg opacity-0 blur-md transition-opacity group-hover:opacity-100 ${a.glow}`}
      />
      <ArrowUpRight
        size={11}
        strokeWidth={2.4}
        className={`absolute top-2 right-2 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 ${a.text}`}
      />
      <div className="relative flex items-center gap-1.5">
        <Icon size={11} className={a.text} strokeWidth={2.2} />
        <span className="text-muted-foreground text-[10px] font-[510] tracking-wide uppercase">
          {label}
        </span>
      </div>
      <div className="relative flex items-baseline gap-1">
        <span className="text-foreground text-base font-[590]">{animated}</span>
        <span className="text-muted-foreground text-xs">
          ({Math.round(ratio * 100)}%)
        </span>
      </div>
    </motion.button>
  )
}
