'use client'

import { useTranslations } from 'next-intl'

import { cn } from '~/lib/cn'

const ROWS = [
  {
    icon: '⚡',
    labelKey: 'fast' as const,
    delta: '+2',
    deltaClass: 'text-emerald-500',
  },
  {
    icon: '✓',
    labelKey: 'normal' as const,
    delta: '+1',
    deltaClass: 'text-sky-400',
  },
  {
    icon: '💡',
    labelKey: 'hintOrSlow' as const,
    delta: '±0',
    deltaClass: 'text-muted-foreground',
  },
  {
    icon: '✗',
    labelKey: 'wrong' as const,
    delta: '−1',
    deltaClass: 'text-rose-500',
  },
]

export function ScoringGuide() {
  const t = useTranslations('Quiz.scoringGuide')

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
      <p className="text-muted-foreground mb-2.5 text-[11px] font-[510] tracking-wider uppercase">
        {t('title')}
      </p>
      <div className="space-y-1.5">
        {ROWS.map(({ icon, labelKey, delta, deltaClass }) => (
          <div key={labelKey} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground/60 w-4 text-center text-xs">
                {icon}
              </span>
              <span className="text-muted-foreground text-xs">
                {t(labelKey)}
              </span>
            </div>
            <span className={cn('text-xs font-[510]', deltaClass)}>
              {delta} lv
            </span>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground/50 mt-2.5 border-t border-white/[0.05] pt-2 text-[11px]">
        ★ {t('masteredAt')}
      </p>
    </div>
  )
}
