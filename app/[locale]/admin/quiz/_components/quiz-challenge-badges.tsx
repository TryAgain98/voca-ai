'use client'

import { motion } from 'framer-motion'
import { EyeOff, Timer, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

const CHALLENGE_BADGES = [
  { icon: EyeOff, key: 'noHints' as const },
  { icon: Timer, key: 'timed' as const },
  { icon: Zap, key: 'oneShot' as const },
] as const

export function QuizChallengeBadges() {
  const t = useTranslations('Quiz')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-3 gap-2"
    >
      {CHALLENGE_BADGES.map(({ icon: Icon, key }, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 + i * 0.06 }}
          className="border-border/60 bg-muted/30 flex items-center gap-1.5 rounded-lg border px-2.5 py-2"
        >
          <Icon size={14} className="text-primary shrink-0" />
          <span className="text-xs font-[510] tracking-tight">
            {t(`challenge.${key}`)}
          </span>
        </motion.div>
      ))}
    </motion.div>
  )
}
