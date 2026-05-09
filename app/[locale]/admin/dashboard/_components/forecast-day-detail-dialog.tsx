'use client'

import { CalendarDays, Eye, RotateCcw, Target } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

import type { ForecastDay } from '~/hooks/use-word-mastery'

interface ForecastDayDetailDialogProps {
  day: ForecastDay | null
  onClose: () => void
}

export function ForecastDayDetailDialog({
  day,
  onClose,
}: ForecastDayDetailDialogProps) {
  const t = useTranslations('Dashboard')
  const format = useFormatter()

  const isOpen = !!day
  const dateLabel = day
    ? format.dateTime(new Date(`${day.date}T00:00:00`), {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : ''

  const breakdown = day?.breakdown ?? { practicing: 0, relearning: 0 }
  const total = day?.count ?? 0
  const practicingPct = total > 0 ? (breakdown.practicing / total) * 100 : 0
  const relearningPct = total > 0 ? (breakdown.relearning / total) * 100 : 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays size={16} className="text-primary" />
            {dateLabel}
          </DialogTitle>
          <DialogDescription>
            {total > 0
              ? t('forecastWordsCount', { count: total })
              : t('forecastDayDetailEmpty')}
          </DialogDescription>
        </DialogHeader>

        {total > 0 && (
          <div className="space-y-5">
            <div className="bg-muted/30 flex h-2 w-full overflow-hidden rounded-full">
              {breakdown.practicing > 0 && (
                <div
                  className="bg-primary h-full"
                  style={{ width: `${practicingPct}%` }}
                />
              )}
              {breakdown.relearning > 0 && (
                <div
                  className="h-full bg-amber-500"
                  style={{ width: `${relearningPct}%` }}
                />
              )}
            </div>

            <ul className="divide-border/40 divide-y">
              {breakdown.practicing > 0 && (
                <li className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-primary/15 text-primary flex h-8 w-8 items-center justify-center rounded-md">
                      <Target size={14} strokeWidth={2} />
                    </span>
                    <div>
                      <p className="text-foreground text-sm font-[510]">
                        {t('forecastBreakdown.practicing')}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        {t('forecastBreakdown.practicingHint')}
                      </p>
                    </div>
                  </div>
                  <span className="text-foreground text-base font-[590]">
                    {breakdown.practicing}
                  </span>
                </li>
              )}
              {breakdown.relearning > 0 && (
                <li className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/15 text-amber-500">
                      <RotateCcw size={14} strokeWidth={2} />
                    </span>
                    <div>
                      <p className="text-foreground text-sm font-[510]">
                        {t('forecastBreakdown.relearning')}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        {t('forecastBreakdown.relearningHint')}
                      </p>
                    </div>
                  </div>
                  <span className="text-foreground text-base font-[590]">
                    {breakdown.relearning}
                  </span>
                </li>
              )}
            </ul>

            <div className="border-border/60 bg-muted/20 flex items-start gap-2 rounded-md border p-3">
              <Eye
                size={14}
                className="text-muted-foreground mt-0.5 shrink-0"
                strokeWidth={2}
              />
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {t('forecastPrivacyHint')}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
