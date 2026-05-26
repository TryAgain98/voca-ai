'use client'

import { Clock, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import { evaluatePassageExamOutcome, scoreColor } from '~/lib/passage-score'
import { cn } from '~/lib/utils'

import type { Passage, PassageSession } from '~/types'

interface PassageRowProps {
  index: number
  passage: Passage
  lastExam: PassageSession | undefined
  onDelete: (id: string) => void
}

function relativeDate(dateStr: string, locale: string): string {
  const diffMs = new Date(dateStr).getTime() - Date.now()
  const absSec = Math.abs(diffMs) / 1000
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (absSec < 3600) return rtf.format(Math.round(diffMs / 60000), 'minute')
  if (absSec < 86400) return rtf.format(Math.round(diffMs / 3600000), 'hour')
  if (absSec < 604800) return rtf.format(Math.round(diffMs / 86400000), 'day')
  if (absSec < 2592000)
    return rtf.format(Math.round(diffMs / 604800000), 'week')
  return rtf.format(Math.round(diffMs / 2592000000), 'month')
}

function formatDate(dateStr: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr))
}

function formatBenchmark(good: number | null): string | null {
  if (!good) return null
  return `${good}s`
}

interface PassageItemProps {
  passage: Passage
  lastExam: PassageSession | undefined
  onDelete: (id: string) => void
}

export function PassageRow({
  index,
  passage,
  lastExam,
  onDelete,
}: PassageRowProps) {
  const t = useTranslations('Passages')
  const locale = useLocale()
  const wordCount = passage.content.trim().split(/\s+/).length
  const benchmark = formatBenchmark(passage.time_good)
  const hasExam = !!lastExam
  const examOutcome = lastExam
    ? evaluatePassageExamOutcome(
        lastExam.word_results,
        lastExam.duration_seconds,
        passage.time_good,
      )
    : null
  const examScore = lastExam?.overall_score ?? lastExam?.pronunciation_score

  return (
    <tr className="group border-border hover:bg-muted/30 border-b transition-colors">
      <td className="text-muted-foreground py-3 pr-3 pl-4 text-center text-xs tabular-nums">
        {index}
      </td>

      <td className="py-3 pr-3 pl-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-foreground text-sm font-medium">
            {passage.title}
          </span>
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <span>{t('wordsCount', { count: wordCount })}</span>
            {benchmark && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {benchmark}
                </span>
              </>
            )}
          </div>
        </div>
      </td>

      <td className="text-muted-foreground px-3 py-3 text-xs whitespace-nowrap">
        {formatDate(passage.created_at, locale)}
      </td>

      <td className="px-3 py-3">
        {hasExam && examOutcome ? (
          <span
            className={cn(
              'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
              examOutcome.passed
                ? 'bg-emerald-400/10 text-emerald-400'
                : 'bg-red-400/10 text-red-400',
            )}
          >
            {examOutcome.passed ? t('passed') : t('notPassed')}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">
            {t('notExamined')}
          </span>
        )}
      </td>

      <td className="px-3 py-3">
        {typeof examScore === 'number' ? (
          <span className={cn('text-xs font-semibold', scoreColor(examScore))}>
            {examScore}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </td>

      <td className="text-muted-foreground px-3 py-3 text-xs">
        {lastExam ? relativeDate(lastExam.created_at, locale) : '—'}
      </td>

      <td className="py-3 pr-4 pl-3">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
            onClick={() => onDelete(passage.id)}
          >
            <Trash2 size={13} />
          </Button>

          <Link href={`/${locale}/admin/passages/${passage.id}/practice`}>
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
              {t('practiceButton')}
            </Button>
          </Link>
          <Link href={`/${locale}/admin/passages/${passage.id}/exam`}>
            <Button
              variant={examOutcome?.passed ? 'outline' : 'default'}
              size="sm"
              className="h-7 gap-1.5 text-xs"
            >
              {examOutcome?.passed ? t('retakeExamButton') : t('examButton')}
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  )
}

export function PassageCard({ passage, lastExam, onDelete }: PassageItemProps) {
  const t = useTranslations('Passages')
  const locale = useLocale()
  const wordCount = passage.content.trim().split(/\s+/).length
  const benchmark = formatBenchmark(passage.time_good)
  const hasExam = !!lastExam
  const examOutcome = lastExam
    ? evaluatePassageExamOutcome(
        lastExam.word_results,
        lastExam.duration_seconds,
        passage.time_good,
      )
    : null
  const examScore = lastExam?.overall_score ?? lastExam?.pronunciation_score

  return (
    <div className="px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-foreground line-clamp-2 text-sm leading-5 font-medium">
            {passage.title}
          </h2>
          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span>{t('wordsCount', { count: wordCount })}</span>
            {benchmark && (
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {benchmark}
              </span>
            )}
            <span>{formatDate(passage.created_at, locale)}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive shrink-0"
          onClick={() => onDelete(passage.id)}
          title={t('deleteButton')}
        >
          <Trash2 size={13} />
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {hasExam && examOutcome ? (
          <span
            className={cn(
              'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
              examOutcome.passed
                ? 'bg-emerald-400/10 text-emerald-400'
                : 'bg-red-400/10 text-red-400',
            )}
          >
            {examOutcome.passed ? t('passed') : t('notPassed')}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">
            {t('notExamined')}
          </span>
        )}

        {typeof examScore === 'number' && (
          <span className={cn('text-xs font-semibold', scoreColor(examScore))}>
            {t('tableColScore')}: {examScore}
          </span>
        )}

        <span className="text-muted-foreground text-xs">
          {t('tableColLastExam')}:{' '}
          {lastExam ? relativeDate(lastExam.created_at, locale) : '—'}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link href={`/${locale}/admin/passages/${passage.id}/practice`}>
          <Button variant="outline" size="sm" className="h-8 w-full text-xs">
            {t('practiceButton')}
          </Button>
        </Link>
        <Link href={`/${locale}/admin/passages/${passage.id}/exam`}>
          <Button
            variant={examOutcome?.passed ? 'outline' : 'default'}
            size="sm"
            className="h-8 w-full text-xs"
          >
            {examOutcome?.passed ? t('retakeExamButton') : t('examButton')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
