'use client'

import { motion } from 'framer-motion'

import { cn } from '~/lib/cn'

type TimerUrgency = 'normal' | 'warn' | 'danger'
type MascotMood = 'focus' | 'celebrate' | 'stumble' | 'hint'

interface QuizMascotProps {
  percent: number
  urgency: TimerUrgency
  mood: MascotMood
}

function getExpression(mood: MascotMood, urgency: TimerUrgency) {
  if (mood === 'celebrate')
    return { eye: 'happy', beak: 'M10 14 L12 16 L14 14' }
  if (mood === 'stumble') return { eye: 'cross', beak: 'M10 15 Q12 13 14 15' }
  if (urgency === 'danger') return { eye: 'wide', beak: 'M10 15 L12 13 L14 15' }
  return { eye: 'dot', beak: 'M10 14 L12 16 L14 14' }
}

function Eye({ kind, x }: { kind: string; x: number }) {
  if (kind === 'happy') {
    return (
      <path
        d={`M${x - 2} 14 Q${x} 11 ${x + 2} 14`}
        className="fill-none stroke-slate-900"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    )
  }
  if (kind === 'cross') {
    return (
      <g className="stroke-slate-900" strokeWidth="1.4" strokeLinecap="round">
        <path d={`M${x - 1.8} 11.2 L${x + 1.8} 14.8`} />
        <path d={`M${x + 1.8} 11.2 L${x - 1.8} 14.8`} />
      </g>
    )
  }
  return (
    <circle
      cx={x}
      cy="13"
      r={kind === 'wide' ? 2.2 : 1.5}
      className="fill-slate-900"
    />
  )
}

export function QuizMascot({ percent, urgency, mood }: QuizMascotProps) {
  const clamped = Math.max(0, Math.min(100, percent))
  const expression = getExpression(mood, urgency)
  const isRushing = urgency === 'danger'
  const isCelebrating = mood === 'celebrate'
  const isStumbling = mood === 'stumble'

  return (
    <div className="relative h-16">
      <div className="via-border absolute inset-x-3 top-9 h-px bg-gradient-to-r from-transparent to-transparent" />
      <motion.div
        className="absolute top-1"
        initial={false}
        animate={{
          left: `calc(${clamped}% - 20px)`,
          y: isCelebrating ? [0, -13, 0] : isRushing ? [0, -3, 0] : [0, -2, 0],
          rotate: isStumbling ? [0, -10, 8, 0] : isRushing ? [-3, 4, -3] : 0,
        }}
        transition={{
          left: { type: 'spring', stiffness: 120, damping: 20 },
          y: {
            duration: isCelebrating ? 0.52 : isRushing ? 0.28 : 1.3,
            repeat: isCelebrating ? 0 : Infinity,
            ease: 'easeInOut',
          },
          rotate: {
            duration: isStumbling ? 0.55 : 0.35,
            repeat: isRushing ? Infinity : 0,
          },
        }}
      >
        <div
          className={cn(
            'relative flex size-12 items-center justify-center rounded-full border shadow-lg',
            mood === 'hint'
              ? 'border-amber-300/50 bg-amber-300/15 shadow-amber-500/15'
              : isStumbling
                ? 'border-rose-400/40 bg-rose-500/10 shadow-rose-500/10'
                : 'border-cyan-300/40 bg-cyan-300/10 shadow-cyan-500/10',
          )}
        >
          <svg
            viewBox="0 0 32 32"
            className="size-10"
            aria-label="Quiz mascot owl"
            role="img"
          >
            <path
              d="M7 12 C7 6 11 4 16 4 C21 4 25 6 25 12 V20 C25 25 21 28 16 28 C11 28 7 25 7 20 Z"
              className="fill-slate-800 dark:fill-slate-100"
            />
            <path
              d="M8 9 L11 4 L13 8 M24 9 L21 4 L19 8"
              className="fill-cyan-400/80"
            />
            <circle cx="12" cy="13" r="5" className="fill-white" />
            <circle cx="20" cy="13" r="5" className="fill-white" />
            <Eye kind={expression.eye} x={12} />
            <Eye kind={expression.eye} x={20} />
            <path
              d={expression.beak}
              className="fill-none stroke-amber-400"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 21 Q16 25 22 21"
              className="fill-none stroke-cyan-400/70"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {isRushing && (
            <span className="absolute top-5 -right-4 h-px w-4 bg-rose-400/60" />
          )}
        </div>
      </motion.div>
    </div>
  )
}

export type { MascotMood, TimerUrgency }
