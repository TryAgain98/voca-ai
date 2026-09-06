'use client'

import { CalendarCheck } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { Progress } from '~/components/ui/progress'
import { Skeleton } from '~/components/ui/skeleton'

import type { DailyTask } from '~/types'

interface DailyProgressCardProps {
  doneCount: number
  totalCount: number
  nextTask: Pick<DailyTask, 'title' | 'start_time' | 'end_time'> | null
  isLoading: boolean
}

export function DailyProgressCard({
  doneCount,
  totalCount,
  nextTask,
  isLoading,
}: DailyProgressCardProps) {
  const t = useTranslations('Dashboard')
  const params = useParams()
  const locale = params.locale as string

  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0

  return (
    <Link
      href={`/${locale}/admin/plans`}
      className="border-border bg-card hover:bg-accent/40 flex flex-col gap-3 rounded-xl border p-6 transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <CalendarCheck size={16} strokeWidth={1.8} />
          </div>
          <p className="text-foreground text-sm font-[510]">
            {t('dailyProgressTitle')}
          </p>
        </div>
        {!isLoading && (
          <span className="text-muted-foreground text-xs">
            {t('dailyProgressLink')}
          </span>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-6 w-32" />
      ) : (
        <>
          <p className="text-foreground text-2xl leading-none font-[590]">
            {t('dailyProgressSubtitle', { done: doneCount, total: totalCount })}
          </p>
          <Progress value={progress} />
          {nextTask && (
            <p className="text-muted-foreground text-xs">
              {t('dailyProgressNext', {
                title: nextTask.title,
                start: nextTask.start_time.slice(0, 5),
                end: nextTask.end_time.slice(0, 5),
              })}
            </p>
          )}
        </>
      )}
    </Link>
  )
}
