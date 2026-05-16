'use client'

import { motion } from 'framer-motion'
import { Timer } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '~/lib/cn'

const SIZE = 44
const STROKE = 3
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const TICK_MS = 100
const WARN_RATIO = 0.5
const DANGER_RATIO = 0.25

interface QuestionTimerProps {
  durationMs: number
  onExpire: () => void
  onTick?: (intensity: 'low' | 'medium' | 'high') => void
  onUrgencyChange?: (urgency: 'normal' | 'warn' | 'danger') => void
}

export function QuestionTimer({
  durationMs,
  onExpire,
  onTick,
  onUrgencyChange,
}: QuestionTimerProps) {
  const [remaining, setRemaining] = useState(durationMs)
  const expiredRef = useRef(false)
  const onExpireRef = useRef(onExpire)
  const onTickRef = useRef(onTick)
  const onUrgencyChangeRef = useRef(onUrgencyChange)
  const lastSecondRef = useRef(Math.ceil(durationMs / 1000))
  const lastUrgencyRef = useRef<'normal' | 'warn' | 'danger'>('normal')

  useEffect(() => {
    onExpireRef.current = onExpire
    onTickRef.current = onTick
    onUrgencyChangeRef.current = onUrgencyChange
  })

  useEffect(() => {
    const startedAt = Date.now()
    const id = setInterval(() => {
      const left = Math.max(0, durationMs - (Date.now() - startedAt))
      const seconds = Math.ceil(left / 1000)
      const ratio = left / durationMs
      const urgency =
        ratio < DANGER_RATIO ? 'danger' : ratio < WARN_RATIO ? 'warn' : 'normal'
      setRemaining(left)
      if (urgency !== lastUrgencyRef.current) {
        lastUrgencyRef.current = urgency
        onUrgencyChangeRef.current?.(urgency)
      }
      if (seconds !== lastSecondRef.current && seconds > 0) {
        lastSecondRef.current = seconds
        const intensity =
          seconds <= 5 ? 'high' : seconds <= 10 ? 'medium' : 'low'
        if (seconds <= 10 || seconds % 3 === 0) {
          onTickRef.current?.(intensity)
        }
      }
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true
        clearInterval(id)
        onExpireRef.current()
      }
    }, TICK_MS)
    return () => clearInterval(id)
  }, [durationMs])

  const ratio = remaining / durationMs
  const isWarn = ratio < WARN_RATIO && ratio >= DANGER_RATIO
  const isDanger = ratio < DANGER_RATIO
  const offset = CIRCUMFERENCE * (1 - ratio)
  const seconds = Math.ceil(remaining / 1000)

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="text-muted/40"
          stroke="currentColor"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={cn(
            'transition-colors duration-200',
            isDanger
              ? 'text-red-500'
              : isWarn
                ? 'text-amber-400'
                : 'text-indigo-400',
          )}
          stroke="currentColor"
          style={{ transition: 'stroke-dashoffset 100ms linear' }}
        />
      </svg>
      <motion.div
        key={isDanger ? 'danger' : isWarn ? 'warn' : 'normal'}
        initial={{ scale: 0.85, opacity: 0.6 }}
        animate={isDanger ? { scale: [1, 1.12, 1] } : { scale: 1, opacity: 1 }}
        transition={
          isDanger ? { duration: 0.6, repeat: Infinity } : { duration: 0.2 }
        }
        className={cn(
          'absolute inset-0 flex items-center justify-center text-xs font-[590]',
          isDanger
            ? 'text-red-500'
            : isWarn
              ? 'text-amber-400'
              : 'text-foreground',
        )}
      >
        {seconds > 0 ? seconds : <Timer size={14} strokeWidth={2} />}
      </motion.div>
    </div>
  )
}
