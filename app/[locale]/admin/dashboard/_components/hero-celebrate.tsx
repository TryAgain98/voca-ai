'use client'

import { motion } from 'framer-motion'
import { PartyPopper, Sparkles, Wand2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { CelebrateActionCard } from './celebrate-action-card'
import { HeroFireworks } from './hero-fireworks'

interface HeroCelebrateProps {
  wrongTodayCount: number
  unlearnedCount: number
  onPracticeWrong: () => void
  onLearnNew: () => void
}

export function HeroCelebrate({
  wrongTodayCount,
  unlearnedCount,
  onPracticeWrong,
  onLearnNew,
}: HeroCelebrateProps) {
  const t = useTranslations('Dashboard.hero')
  const hasWrongToday = wrongTodayCount > 0
  const hasUnlearned = unlearnedCount > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-linear-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-7"
    >
      <HeroFireworks />

      <motion.div
        className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl"
        animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.95, 0.5] }}
        transition={{ duration: 3.2, repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-amber-400/15 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, delay: 0.6 }}
      />

      <div className="relative flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500 px-2.5 py-1 text-[10px] font-[590] tracking-widest text-emerald-500 uppercase"
          >
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            {t('badge.celebrate')}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-foreground mt-2.5 text-2xl leading-tight font-[590] tracking-[-0.5px] sm:text-3xl"
          >
            {t('title.celebrate')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18 }}
            className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed"
          >
            {t('subtitle.celebrate')}
          </motion.p>
        </div>

        <motion.div
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.6 }}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500"
        >
          <PartyPopper size={28} strokeWidth={1.7} />
        </motion.div>
      </div>

      {hasWrongToday && (
        <CelebrateActionCard
          accent="amber"
          icon={<Sparkles size={16} strokeWidth={1.8} />}
          headline={t('celebrateWrong.headline', { count: wrongTodayCount })}
          encourage={t('celebrateWrong.encourage')}
          ctaLabel={t('celebrateWrong.cta', { count: wrongTodayCount })}
          onCta={onPracticeWrong}
        />
      )}

      {hasUnlearned && (
        <CelebrateActionCard
          accent="sky"
          icon={<Wand2 size={16} strokeWidth={1.8} />}
          headline={t('celebrateLearn.headline')}
          encourage={t('celebrateLearn.encourage', { count: unlearnedCount })}
          ctaLabel={t('celebrateLearn.cta', { count: unlearnedCount })}
          onCta={onLearnNew}
        />
      )}
    </motion.div>
  )
}
