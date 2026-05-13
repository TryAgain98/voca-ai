'use client'

import { Flame, Sparkles, Star, TrendingUp, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import { cn } from '~/lib/cn'
import { STREAK_FACTOR } from '~/lib/score-config'

import type { ScoreBreakdown } from '~/lib/score-config'

interface ScoreTier {
  label: string
  color: string
  bg: string
  border: string
  icon: React.ElementType
  glow: string
}

function getTier(
  score: number,
): 'elite' | 'advanced' | 'rising' | 'beginner' | 'new' {
  if (score >= 400) return 'elite'
  if (score >= 200) return 'advanced'
  if (score >= 50) return 'rising'
  if (score > 0) return 'beginner'
  return 'new'
}

const TIER_ICONS = {
  elite: Sparkles,
  advanced: Star,
  rising: TrendingUp,
  beginner: Flame,
  new: Zap,
} as const

const TIER_STYLES: Record<string, ScoreTier> = {
  elite: {
    label: 'scoreTierElite',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
    icon: Sparkles,
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]',
  },
  advanced: {
    label: 'scoreTierAdvanced',
    color: 'text-[#7170ff]',
    bg: 'bg-[#5e6ad2]/10',
    border: 'border-[#5e6ad2]/25',
    icon: Star,
    glow: 'shadow-[0_0_12px_rgba(94,106,210,0.2)]',
  },
  rising: {
    label: 'scoreTierRising',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    icon: TrendingUp,
    glow: '',
  },
  beginner: {
    label: 'scoreTierBeginner',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/25',
    icon: Flame,
    glow: '',
  },
  new: {
    label: 'scoreTierNew',
    color: 'text-muted-foreground',
    bg: 'bg-white/[0.03]',
    border: 'border-white/[0.08]',
    icon: Zap,
    glow: '',
  },
}

interface UserScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  breakdown?: ScoreBreakdown
}

export function UserScoreBadge({
  score,
  size = 'md',
  breakdown,
}: UserScoreBadgeProps) {
  const t = useTranslations('Users')
  const tierKey = getTier(score)
  const tier = TIER_STYLES[tierKey]!
  const Icon = TIER_ICONS[tierKey]

  const badge = (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5',
          tier.bg,
          tier.border,
          tier.glow,
          breakdown && 'cursor-help',
        )}
      >
        <Icon
          size={size === 'lg' ? 14 : 12}
          className={cn(tier.color, 'shrink-0')}
          strokeWidth={2}
        />
        <span
          className={cn(
            'leading-none font-[590] tabular-nums',
            tier.color,
            size === 'lg'
              ? 'text-2xl'
              : size === 'md'
                ? 'text-xl'
                : 'text-base',
          )}
        >
          {score}
        </span>
      </div>
      <span
        className={cn(
          'text-[10px] font-[510] tracking-wider uppercase',
          tier.color,
        )}
      >
        {t(tier.label as Parameters<typeof t>[0])}
      </span>
    </div>
  )

  if (!breakdown) return badge

  const multiplier = 1 + breakdown.streakDays * STREAK_FACTOR

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{badge}</TooltipTrigger>
        <TooltipContent side="left" className="overflow-hidden p-0">
          <div className="min-w-52">
            <p className="px-3 pt-2.5 pb-1.5 text-[10px] font-[590] tracking-widest uppercase opacity-60">
              {t('scoreTooltipTitle')}
            </p>
            <div className="divide-y divide-white/6">
              <div className="flex items-center justify-between gap-4 px-3 py-2">
                <span className="text-[11px] font-[510]">
                  {t('scoreTooltipMastered')}
                </span>
                <span className="text-[11px] font-[590] text-emerald-400 tabular-nums">
                  {breakdown.masteredCount} {t('scoreTooltipWords')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 px-3 py-2">
                <span className="text-[11px] font-[510]">
                  {t('scoreTooltipStreak')}
                </span>
                <span className="text-[11px] font-[590] text-orange-400 tabular-nums">
                  {breakdown.streakDays} {t('scoreTooltipDays')} → ×
                  {multiplier.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-white/6 px-3 py-2">
              <span className="text-[10px] font-[510] opacity-50">
                {breakdown.masteredCount} × {multiplier.toFixed(2)}
              </span>
              <span className="text-[11px] font-[590] tabular-nums">
                {score}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
