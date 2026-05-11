'use client'

import { useTranslations } from 'next-intl'

import { cn } from '~/lib/cn'

import { ROWS } from '../scoring-guide'

export function ScoringGuidePopup() {
  const t = useTranslations('Quiz.scoringGuide')

  return (
    <div className="w-52 space-y-1.5">
      <p className="text-muted-foreground mb-2 text-[10px] font-[510] tracking-wider uppercase">
        {t('title')}
      </p>
      {ROWS.map(({ icon, labelKey, delta, deltaClass }) => (
        <div key={labelKey} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground/60 w-4 text-center text-xs">
              {icon}
            </span>
            <span className="text-muted-foreground text-xs">{t(labelKey)}</span>
          </div>
          <span className={cn('text-xs font-[510]', deltaClass)}>
            {delta} lv
          </span>
        </div>
      ))}
      <p className="text-muted-foreground/50 mt-2 border-t border-white/[0.05] pt-2 text-[10px]">
        ★ {t('masteredAt')}
      </p>
    </div>
  )
}
