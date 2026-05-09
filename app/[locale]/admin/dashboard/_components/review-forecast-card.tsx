'use client'

import { motion } from 'framer-motion'
import { CalendarClock, Sparkles } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import { useState } from 'react'

import { Skeleton } from '~/components/ui/skeleton'
import { cn } from '~/lib/utils'

import { ForecastDayDetailDialog } from './forecast-day-detail-dialog'

import type { ForecastDay, ReviewForecast } from '~/hooks/use-word-mastery'

interface ReviewForecastCardProps {
  forecast: ReviewForecast | null | undefined
  isLoading: boolean
}

const BAR_AREA_PX = 64
const BAR_MIN_PCT = 8

function todayKey(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function barHeightPct(count: number, max: number): number {
  if (count === 0 || max <= 0) return 0
  return Math.max(BAR_MIN_PCT, Math.round((count / max) * 100))
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
      <div className="border-border bg-card relative overflow-hidden rounded-xl border p-6">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-3 h-7 w-56" />
        <Skeleton className="mt-2 h-3 w-44" />
        <div className="mt-6 flex gap-2">
          {Array.from({ length: 14 }).map((_, i) => (
            <Skeleton key={i} className="h-24 flex-1 rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  const days = forecast?.forecast ?? []
  const maxCount = days.reduce((m, d) => Math.max(m, d.count), 0)
  const todayId = todayKey()

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
    ? format.dateTime(new Date(`${nextDate}T00:00:00`), {
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
      className="border-border bg-card relative overflow-hidden rounded-xl border p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-[11px] font-[510] tracking-widest uppercase">
            {t('forecastNextReview')}
          </p>
          <div className="mt-1.5">{renderHeadline()}</div>
          <p className="text-muted-foreground mt-1.5 text-sm">{subtitle}</p>
        </div>
        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          {totalUpcoming > 0 ? (
            <CalendarClock size={18} strokeWidth={1.8} />
          ) : (
            <Sparkles size={18} strokeWidth={1.8} />
          )}
        </div>
      </div>

      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-muted-foreground text-[10px] font-[510] tracking-wide uppercase">
            {t('forecastNext14Days')}
          </span>
          <span className="text-muted-foreground/70 text-[10px]">
            {totalUpcoming > 0
              ? t('forecastTotalUpcoming', { count: totalUpcoming })
              : ''}
          </span>
        </div>

        <div className="flex items-end gap-1.5">
          {days.map((day) => {
            const isToday = day.date === todayId
            const dayLabel = format.dateTime(new Date(`${day.date}T00:00:00`), {
              weekday: 'narrow',
            })
            const dateNum = format.dateTime(new Date(`${day.date}T00:00:00`), {
              day: 'numeric',
            })
            const heightPct = barHeightPct(day.count, maxCount)
            const hasReviews = day.count > 0

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
                  'group flex flex-1 flex-col items-center gap-1.5 rounded-md px-1 py-1.5 transition',
                  hasReviews
                    ? 'hover:bg-muted/40 cursor-pointer'
                    : 'cursor-default',
                  isToday && 'bg-primary/5',
                )}
              >
                <div
                  className="relative flex w-full items-end justify-center"
                  style={{ height: BAR_AREA_PX }}
                >
                  {hasReviews && (
                    <span className="text-foreground absolute -top-0.5 text-[10px] font-[590]">
                      {day.count}
                    </span>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={cn(
                      'w-full max-w-[18px] rounded-sm',
                      hasReviews
                        ? isToday
                          ? 'bg-primary'
                          : 'bg-primary/70 group-hover:bg-primary/90'
                        : 'bg-muted/40',
                    )}
                    style={{
                      minHeight: hasReviews ? 4 : 2,
                    }}
                  />
                </div>
                <div className="flex flex-col items-center leading-tight">
                  <span
                    className={cn(
                      'text-[9px] font-[510] tracking-wide uppercase',
                      isToday ? 'text-primary' : 'text-muted-foreground/80',
                    )}
                  >
                    {dayLabel}
                  </span>
                  <span
                    className={cn(
                      'text-[11px]',
                      isToday
                        ? 'text-primary font-[590]'
                        : 'text-foreground/80 font-[510]',
                    )}
                  >
                    {dateNum}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <ForecastDayDetailDialog day={openDay} onClose={() => setOpenDay(null)} />
    </motion.div>
  )
}
