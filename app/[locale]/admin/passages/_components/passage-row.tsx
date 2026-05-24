'use client'

import { Clock, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import { scoreColor } from '~/lib/passage-score'
import { cn } from '~/lib/utils'

import type { Passage, PassageSession } from '~/types'

interface PassageRowProps {
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

function formatBenchmarks(
  good: number | null,
  ok: number | null,
  acceptable: number | null,
): string | null {
  if (!good && !ok && !acceptable) return null
  return [good, ok, acceptable]
    .filter(Boolean)
    .map((s) => `${s}s`)
    .join(' — ')
}

export function PassageRow({ passage, lastExam, onDelete }: PassageRowProps) {
  const t = useTranslations('Passages')
  const locale = useLocale()
  const wordCount = passage.content.trim().split(/\s+/).length
  const benchmarks = formatBenchmarks(
    passage.time_good,
    passage.time_ok,
    passage.time_acceptable,
  )
  const hasExam = !!lastExam

  return (
    <tr className="group border-border hover:bg-muted/30 border-b transition-colors">
      <td className="py-3 pr-3 pl-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-foreground text-sm font-medium">
            {passage.title}
          </span>
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <span>{t('wordsCount', { count: wordCount })}</span>
            {benchmarks && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {benchmarks}
                </span>
              </>
            )}
          </div>
        </div>
      </td>

      <td className="px-3 py-3">
        {hasExam ? (
          <span
            className={cn(
              'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
              scoreColor(lastExam.overall_score ?? 0),
              (lastExam.overall_score ?? 0) >= 85
                ? 'bg-emerald-400/10'
                : (lastExam.overall_score ?? 0) >= 65
                  ? 'bg-amber-400/10'
                  : 'bg-red-400/10',
            )}
          >
            {lastExam.overall_score ?? lastExam.pronunciation_score ?? '—'}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">
            {t('notExamined')}
          </span>
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
            <Button size="sm" className="h-7 gap-1.5 text-xs">
              {t('examButton')}
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  )
}
