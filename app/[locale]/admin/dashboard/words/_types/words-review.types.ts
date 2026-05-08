import { Award, Brain, CheckCircle2, Compass, Sparkles } from 'lucide-react'

import type { LucideIcon } from 'lucide-react'

export const TAB_KEYS = ['untouched', 'practicing', 'mastered'] as const
export type TabKey = (typeof TAB_KEYS)[number]

export interface TabVisual {
  icon: LucideIcon
  iconBg: string
  iconText: string
  emptyIcon: LucideIcon
}

export const TAB_VISUALS: Record<TabKey, TabVisual> = {
  untouched: {
    icon: Compass,
    iconBg: 'bg-sky-500/15',
    iconText: 'text-sky-500',
    emptyIcon: Sparkles,
  },
  practicing: {
    icon: Brain,
    iconBg: 'bg-primary/15',
    iconText: 'text-primary',
    emptyIcon: CheckCircle2,
  },
  mastered: {
    icon: Award,
    iconBg: 'bg-emerald-500/15',
    iconText: 'text-emerald-500',
    emptyIcon: Sparkles,
  },
}

export interface CtaConfig {
  label: string
  icon: LucideIcon
  count?: number
  onClick: () => void
  disabled?: boolean
}

export function isTabKey(value: string | null): value is TabKey {
  return value !== null && (TAB_KEYS as readonly string[]).includes(value)
}
