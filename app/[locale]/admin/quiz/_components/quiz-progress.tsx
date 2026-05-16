'use client'

import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef } from 'react'

import { cn } from '~/lib/cn'

const MILESTONES = [30, 50, 70, 90]

interface QuizProgressProps {
  percent: number
  onMilestone?: (milestone: number) => void
}

function getFillClass(percent: number): string {
  if (percent >= 90) return 'from-rose-400 via-amber-300 to-emerald-300'
  if (percent >= 70) return 'from-amber-400 via-orange-300 to-emerald-300'
  if (percent >= 50) return 'from-emerald-400 via-cyan-300 to-sky-400'
  if (percent >= 30) return 'from-cyan-400 via-sky-400 to-indigo-400'
  return 'from-indigo-400 via-violet-400 to-sky-400'
}

export function QuizProgress({ percent, onMilestone }: QuizProgressProps) {
  const clamped = Math.max(0, Math.min(100, percent))
  const reached = useMemo(
    () => MILESTONES.filter((milestone) => clamped >= milestone),
    [clamped],
  )
  const lastReachedRef = useRef(0)

  useEffect(() => {
    const latest = reached[reached.length - 1] ?? 0
    if (latest > lastReachedRef.current) {
      lastReachedRef.current = latest
      onMilestone?.(latest)
    }
  }, [onMilestone, reached])

  return (
    <div className="relative py-2">
      <div className="bg-muted/80 relative h-3 overflow-hidden rounded-full border border-white/5 shadow-inner">
        <motion.div
          className={cn(
            'absolute inset-y-0 left-0 overflow-hidden rounded-full bg-gradient-to-r',
            getFillClass(clamped),
          )}
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={{ type: 'spring', stiffness: 160, damping: 24 }}
        >
          <motion.div
            className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.34),transparent)]"
            animate={{ x: ['-120%', '140%'] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>

      {MILESTONES.map((milestone) => {
        const isReached = clamped >= milestone
        return (
          <motion.div
            key={milestone}
            className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            style={{ left: `${milestone}%` }}
            animate={isReached ? { scale: [1, 1.28, 1] } : { scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <span
              className={cn(
                'size-3 rounded-full border transition-colors',
                isReached
                  ? 'border-white/70 bg-white shadow-[0_0_14px_rgba(255,255,255,0.55)]'
                  : 'border-muted-foreground/25 bg-background',
              )}
            />
            <span
              className={cn(
                'absolute top-4 text-[9px] font-[590] tabular-nums transition-colors',
                isReached ? 'text-foreground' : 'text-muted-foreground/45',
              )}
            >
              {milestone}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}
