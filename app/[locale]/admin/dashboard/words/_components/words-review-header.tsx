'use client'

import { ArrowLeft, Library } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'

interface WordsReviewHeaderProps {
  totalCount: number
  onBack: () => void
}

export function WordsReviewHeader({
  totalCount,
  onBack,
}: WordsReviewHeaderProps) {
  const t = useTranslations('DashboardWords')
  return (
    <header className="flex items-center gap-2.5">
      <Button variant="ghost" size="icon-sm" onClick={onBack} title={t('back')}>
        <ArrowLeft size={16} />
      </Button>
      <div className="bg-muted text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
        <Library size={15} strokeWidth={1.8} />
      </div>
      <h1 className="text-foreground truncate text-lg font-[590] tracking-[-0.3px]">
        {t('title')}
      </h1>
      <span className="text-muted-foreground/60 hidden text-sm sm:inline">
        ·
      </span>
      <span className="text-muted-foreground hidden text-sm tabular-nums sm:inline">
        {t('totalWords', { count: totalCount })}
      </span>
    </header>
  )
}
