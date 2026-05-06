'use client'

import { Flame, Sparkles, Star, TrendingUp, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '~/lib/cn'

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
  if (score >= 80) return 'elite'
  if (score >= 60) return 'advanced'
  if (score >= 35) return 'rising'
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
}

export function UserScoreBadge({ score, size = 'md' }: UserScoreBadgeProps) {
  const t = useTranslations('Users')
  const tierKey = getTier(score)
  const tier = TIER_STYLES[tierKey]!
  const Icon = TIER_ICONS[tierKey]

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-lg border px-3 py-1.5',
          tier.bg,
          tier.border,
          tier.glow,
        )}
      >
        <Icon
          size={size === 'lg' ? 16 : 14}
          className={cn(tier.color, 'shrink-0')}
          strokeWidth={2}
        />
        <span
          className={cn(
            'leading-none font-[590] tabular-nums',
            tier.color,
            size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-lg',
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
}
