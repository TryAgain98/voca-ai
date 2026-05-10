'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import { Button } from '~/components/ui/button'

import type { ReactNode } from 'react'

export type CelebrateAccent = 'amber' | 'sky'

const ACCENT_CLASSES: Record<
  CelebrateAccent,
  {
    border: string
    bg: string
    icon: string
    headline: string
    button: string
  }
> = {
  amber: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/[0.04]',
    icon: 'bg-amber-500/15 text-amber-500',
    headline: 'text-amber-500',
    button: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  sky: {
    border: 'border-sky-500/30',
    bg: 'bg-sky-500/[0.04]',
    icon: 'bg-sky-500/15 text-sky-500',
    headline: 'text-sky-500',
    button: 'bg-sky-500 hover:bg-sky-600 text-white',
  },
}

interface CelebrateActionCardProps {
  accent: CelebrateAccent
  icon: ReactNode
  headline: string
  encourage: string
  ctaLabel: string
  onCta: () => void
  delay?: number
  disabled?: boolean
}

export function CelebrateActionCard({
  accent,
  icon,
  headline,
  encourage,
  ctaLabel,
  onCta,
  delay = 0.26,
  disabled,
}: CelebrateActionCardProps) {
  const cls = ACCENT_CLASSES[accent]
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative mt-5 flex flex-col gap-3 rounded-xl border ${cls.border} ${cls.bg} p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cls.icon}`}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className={`text-sm font-[590] ${cls.headline}`}>{headline}</p>
          <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
            {encourage}
          </p>
        </div>
      </div>
      {!disabled && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            size="sm"
            onClick={onCta}
            className={`w-full gap-2 sm:w-auto ${cls.button}`}
          >
            {ctaLabel}
            <ArrowRight size={14} />
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
