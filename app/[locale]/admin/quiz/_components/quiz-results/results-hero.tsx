'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Clock, Target } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import type { ScoreTier } from './score-tier'

const RING_SIZE = 156
const RING_STROKE = 8
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CIRC = 2 * Math.PI * RING_RADIUS

interface ResultsHeroProps {
  total: number
  elapsedSeconds: number
  score: number
  tier: ScoreTier
}

export function ResultsHero({
  total,
  elapsedSeconds,
  score,
  tier,
}: ResultsHeroProps) {
  const t = useTranslations('Quiz.results')
  const motionScore = useMotionValue(0)
  const springScore = useSpring(motionScore, { stiffness: 60, damping: 15 })
  const [displayCount, setDisplayCount] = useState(0)
  const offset = useTransform(springScore, (v) => RING_CIRC * (1 - v))

  useEffect(() => {
    motionScore.set(score)
    const unsub = springScore.on('change', (v) => {
      setDisplayCount(Math.round(v * total))
    })
    return () => unsub()
  }, [score, total, motionScore, springScore])

  const minutes = Math.floor(elapsedSeconds / 60)
  const seconds = elapsedSeconds % 60
  const timeText = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
  const accuracyPercent = Math.round(score * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="border-border bg-card relative overflow-hidden rounded-3xl border px-7 py-8 text-center"
    >
      <motion.div
        className={`pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full blur-3xl ${tier.glow}`}
        animate={{ scale: [1, 1.2, 1], opacity: [0.45, 0.85, 0.45] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className={`pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full blur-3xl ${tier.glow}`}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
      />

      <div className="relative">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 180,
            damping: 12,
            delay: 0.2,
          }}
          className="mb-1 text-5xl"
        >
          <motion.span
            animate={{ rotate: [0, -8, 8, 0], y: [0, -4, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.5 }}
            className="inline-block"
          >
            {tier.emoji}
          </motion.span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className={`text-sm font-[590] tracking-wider uppercase ${tier.accent}`}
        >
          {t(`tier.${tier.key}`)}
        </motion.p>

        <div className="relative mx-auto mt-4 flex items-center justify-center">
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            className="-rotate-90"
            aria-hidden
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              strokeWidth={RING_STROKE}
              className="text-muted/30"
              stroke="currentColor"
            />
            <motion.circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={RING_CIRC}
              style={{ strokeDashoffset: offset }}
              className={tier.ring}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={`text-5xl leading-none font-[590] tracking-[-1px] ${tier.accent}`}
            >
              {displayCount}
            </motion.span>
            <span className="text-muted-foreground mt-1 text-sm font-[510]">
              / {total}
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-5 flex justify-center gap-6"
        >
          <Stat
            icon={<Target size={14} />}
            label={t('accuracy')}
            value={`${accuracyPercent}%`}
            accent={tier.accent}
          />
          <Stat
            icon={<Clock size={14} />}
            label={t('time')}
            value={timeText}
            accent="text-foreground"
          />
        </motion.div>
      </div>
    </motion.div>
  )
}

interface StatProps {
  icon: React.ReactNode
  label: string
  value: string
  accent: string
}

function Stat({ icon, label, value, accent }: StatProps) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="text-muted-foreground flex items-center gap-1 text-[10px] font-[510] tracking-widest uppercase">
        {icon}
        <span>{label}</span>
      </div>
      <span className={`text-base font-[590] ${accent}`}>{value}</span>
    </div>
  )
}
