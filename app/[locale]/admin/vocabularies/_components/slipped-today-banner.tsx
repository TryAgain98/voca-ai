'use client'

import { Dumbbell, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'

interface SlippedTodayBannerProps {
  count: number
  onPracticeNow: () => void
}

export function SlippedTodayBanner({
  count,
  onPracticeNow,
}: SlippedTodayBannerProps) {
  const t = useTranslations('Vocabularies')

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3.5 py-2.5">
      <Sparkles
        size={14}
        strokeWidth={1.8}
        className="shrink-0 text-amber-500"
      />
      <p className="text-muted-foreground min-w-0 flex-1 text-xs">
        <span className="text-foreground font-[510]">
          {t('slippedTodayBannerTitle', { count })}
        </span>
        {' — '}
        {t('slippedTodayBannerDesc')}
      </p>
      <Button
        size="sm"
        onClick={onPracticeNow}
        className="h-7 shrink-0 gap-1.5 px-3 text-xs"
      >
        <Dumbbell size={13} strokeWidth={1.8} />
        {t('slippedTodayPractice')}
      </Button>
    </div>
  )
}
