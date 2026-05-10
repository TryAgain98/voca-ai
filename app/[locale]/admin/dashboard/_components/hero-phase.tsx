'use client'

import { motion } from 'framer-motion'
import { AlertCircle, ArrowRight, Stethoscope, Wand2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'

export type ActionTrack = 'relearn' | 'test' | 'learn'

interface PhaseConfig {
  icon: typeof Stethoscope
  accent: string
  glow: string
  iconAnim: 'pulse' | 'shimmer'
  ctaClass: string
  containerClass: string
}

export const ACTION_PHASE_CONFIG: Record<ActionTrack, PhaseConfig> = {
  relearn: {
    icon: AlertCircle,
    accent: 'text-rose-500',
    glow: 'bg-rose-500/15',
    iconAnim: 'pulse',
    ctaClass: 'bg-rose-500 hover:bg-rose-600 text-white',
    containerClass:
      'relative overflow-hidden rounded-2xl border border-rose-500/30 bg-rose-500/5 p-7',
  },
  test: {
    icon: Stethoscope,
    accent: 'text-orange-500',
    glow: 'bg-orange-500/15',
    iconAnim: 'pulse',
    ctaClass: 'bg-orange-500 hover:bg-orange-600 text-white',
    containerClass:
      'border-border bg-card relative overflow-hidden rounded-2xl border p-7',
  },
  learn: {
    icon: Wand2,
    accent: 'text-sky-500',
    glow: 'bg-sky-500/15',
    iconAnim: 'shimmer',
    ctaClass: 'bg-sky-500 hover:bg-sky-600 text-white',
    containerClass:
      'border-border bg-card relative overflow-hidden rounded-2xl border p-7',
  },
}

function getIconMotion(anim: PhaseConfig['iconAnim']) {
  if (anim === 'pulse') return { scale: [1, 1.08, 1] }
  return { rotate: [0, 14, -14, 0] }
}

interface HeroPhaseProps {
  track: ActionTrack
  total: number
  batch: number
  onCta: () => void
  isViewMode?: boolean
}

export function HeroPhase({
  track,
  total,
  batch,
  onCta,
  isViewMode,
}: HeroPhaseProps) {
  const t = useTranslations('Dashboard.hero')
  const cfg = ACTION_PHASE_CONFIG[track]
  const Icon = cfg.icon
  const queued = Math.max(0, total - batch)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={cfg.containerClass}
    >
      <motion.div
        className={`pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full blur-3xl ${cfg.glow}`}
        animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0.95, 0.6] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className={`pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full blur-3xl ${cfg.glow}`}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
      />
      <div className="relative flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-[590] tracking-widest uppercase ${cfg.accent}`}
            style={{
              borderColor: 'currentColor',
              backgroundColor: 'transparent',
            }}
          >
            <span className="relative inline-flex h-1.5 w-1.5">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${cfg.accent}`}
                style={{ backgroundColor: 'currentColor' }}
              />
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${cfg.accent}`}
                style={{ backgroundColor: 'currentColor' }}
              />
            </span>
            {t(`badge.${track}`)}
          </motion.span>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1"
          >
            <h2 className="text-foreground text-2xl leading-tight font-[590] tracking-[-0.5px] sm:text-3xl">
              {t(`title.${track}`, { count: batch })}
            </h2>
            {queued > 0 && (
              <span className="text-muted-foreground/80 text-xs font-[510] tracking-wide">
                {t('queueTail', { count: queued })}
              </span>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18 }}
            className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed"
          >
            {t(`subtitle.${track}`)}
          </motion.p>

          {!isViewMode && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="mt-5"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block"
              >
                <Button
                  size="lg"
                  onClick={onCta}
                  className={`gap-2 px-5 ${cfg.ctaClass}`}
                >
                  {t(`cta.${track}`, { count: batch })}
                  <ArrowRight size={16} />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>

        <motion.div
          animate={getIconMotion(cfg.iconAnim)}
          transition={{
            duration: cfg.iconAnim === 'pulse' ? 1.6 : 2.2,
            repeat: Infinity,
            repeatDelay: cfg.iconAnim === 'pulse' ? 0 : 1.8,
          }}
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${cfg.glow} ${cfg.accent}`}
        >
          <Icon size={28} strokeWidth={1.7} />
        </motion.div>
      </div>
    </motion.div>
  )
}
