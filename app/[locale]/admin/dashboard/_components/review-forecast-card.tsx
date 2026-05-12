'use client'

import { motion } from 'framer-motion'
import { CalendarClock, Sparkles } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import { useState } from 'react'

import { Skeleton } from '~/components/ui/skeleton'
import { dayjs } from '~/lib/dayjs'
import { cn } from '~/lib/utils'

import { ForecastDayDetailDialog } from './forecast-day-detail-dialog'

import type { ForecastDay, ReviewForecast } from '~/hooks/use-word-mastery'

interface ReviewForecastCardProps {
  forecast: ReviewForecast | null | undefined
  isLoading: boolean
}

type IntensityStyle = { bg: string; text: string }

function intensityStyle(count: number, max: number): IntensityStyle {
  if (count === 0 || max <= 0) {
    return { bg: 'bg-muted/30', text: 'text-transparent' }
  }
  const ratio = count / max
  if (ratio <= 0.25) {
    return { bg: 'bg-primary/25', text: 'text-primary/80' }
  }
  if (ratio <= 0.5) {
    return { bg: 'bg-primary/45', text: 'text-primary-foreground/90' }
  }
  if (ratio <= 0.75) {
    return { bg: 'bg-primary/65', text: 'text-white' }
  }
  return { bg: 'bg-primary/90', text: 'text-white' }
}

export function ReviewForecastCard({
  forecast,
  isLoading,
}: ReviewForecastCardProps) {
  const t = useTranslations('Dashboard')
  const format = useFormatter()
  const [openDay, setOpenDay] = useState<ForecastDay | null>(null)

  if (isLoading) {
    return (
      <div className="border-border bg-card relative overflow-hidden rounded-xl border p-5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-3 h-7 w-56" />
        <Skeleton className="mt-2 h-3 w-44" />
        <div className="mt-5 flex gap-1.5">
          {Array.from({ length: 14 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square flex-1 rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  const days = (forecast?.forecast ?? []).slice(1)
  const maxCount = days.reduce((m, d) => Math.max(m, d.count), 0)

  const nextDate = forecast?.nextFutureDate ?? null
  const nextCount = forecast?.nextFutureCount ?? 0
  const daysUntil = forecast?.daysUntilNextFuture ?? null
  const totalUpcoming = forecast?.totalUpcoming ?? 0
  const renderHeadline = () => {
    if (!nextDate || nextCount === 0) {
      return (
        <p className="text-foreground text-2xl font-[590] tracking-[-0.5px]">
          {t('forecastNoUpcoming')}
        </p>
      )
    }
    const whenLabel =
      daysUntil === 1
        ? t('forecastTomorrow')
        : t('forecastInDays', { count: daysUntil ?? 0 })
    return (
      <p className="text-foreground text-2xl font-[590] tracking-[-0.5px]">
        {whenLabel} ·{' '}
        <span className="text-primary">
          {t('forecastWordsCount', { count: nextCount })}
        </span>
      </p>
    )
  }

  const subtitle = nextDate
    ? format.dateTime(dayjs.utc(nextDate).toDate(), {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    : t('forecastNoUpcomingHint')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="border-border bg-card relative overflow-hidden rounded-xl border p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-[11px] font-[510] tracking-widest uppercase">
            {t('forecastNextReview')}
          </p>
          <div className="mt-1">{renderHeadline()}</div>
          <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
        </div>
        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          {totalUpcoming > 0 ? (
            <CalendarClock size={18} strokeWidth={1.8} />
          ) : (
            <Sparkles size={18} strokeWidth={1.8} />
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-muted-foreground text-[10px] font-[510] tracking-wide uppercase">
            {t('forecastNext14Days')}
          </span>
          <span className="text-muted-foreground/70 text-[10px]">
            {totalUpcoming > 0
              ? t('forecastTotalUpcoming', { count: totalUpcoming })
              : ''}
          </span>
        </div>

        <div className="flex gap-1.5">
          {days.map((day, index) => {
            const dayLabel = format.dateTime(dayjs.utc(day.date).toDate(), {
              weekday: 'narrow',
            })
            const dateNum = format.dateTime(dayjs.utc(day.date).toDate(), {
              day: 'numeric',
            })
            const hasReviews = day.count > 0
            const showDayLabel = index === 0 || index % 2 === 0
            const style = intensityStyle(day.count, maxCount)

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => hasReviews && setOpenDay(day)}
                disabled={!hasReviews}
                title={
                  hasReviews
                    ? t('forecastWordsCount', { count: day.count })
                    : t('forecastDayDetailEmpty')
                }
                className={cn(
                  'group flex flex-1 flex-col items-center gap-1.5 transition',
                  hasReviews ? 'cursor-pointer' : 'cursor-default',
                )}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.25,
                    delay: index * 0.02,
                    ease: 'easeOut',
                  }}
                  className={cn(
                    'relative flex aspect-square w-full items-center justify-center rounded-md transition',
                    style.bg,
                    hasReviews && 'group-hover:brightness-125',
                  )}
                >
                  <span
                    className={cn(
                      'text-[11px] leading-none font-[590] tabular-nums',
                      style.text,
                    )}
                  >
                    {hasReviews ? day.count : ''}
                  </span>
                </motion.div>
                <div className="flex flex-col items-center leading-none">
                  <span
                    className={cn(
                      'text-[9px] font-[510] tracking-wide uppercase',
                      showDayLabel
                        ? 'text-muted-foreground/60'
                        : 'text-transparent',
                    )}
                  >
                    {dayLabel}
                  </span>
                  <span className="text-foreground/70 mt-0.5 text-[11px] font-[510]">
                    {dateNum}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {totalUpcoming > 0 && (
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-muted-foreground/50 text-[10px] leading-tight">
              {t('forecastCountHint')}
            </p>
            <div className="text-muted-foreground/60 flex shrink-0 items-center gap-1.5 text-[10px]">
              <span>{t('forecastLegendLess')}</span>
              <span className="bg-muted/30 size-2.5 rounded-sm" />
              <span className="bg-primary/25 size-2.5 rounded-sm" />
              <span className="bg-primary/45 size-2.5 rounded-sm" />
              <span className="bg-primary/65 size-2.5 rounded-sm" />
              <span className="bg-primary/90 size-2.5 rounded-sm" />
              <span>{t('forecastLegendMore')}</span>
            </div>
          </div>
        )}
      </div>

      <ForecastDayDetailDialog day={openDay} onClose={() => setOpenDay(null)} />
    </motion.div>
  )
}
