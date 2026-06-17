'use client'

import { Edit2, Eye, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

import type { WritingAttempt, WritingExercise } from '~/types'

const SCORE_THRESHOLDS = { good: 80, ok: 60 }

function scoreColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.good) return 'text-emerald-400'
  if (score >= SCORE_THRESHOLDS.ok) return 'text-yellow-400'
  return 'text-red-400'
}

function formatDate(dateStr: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr))
}

interface WritingExerciseRowProps {
  index: number
  exercise: WritingExercise
  lastAttempt: WritingAttempt | undefined
  onDelete: () => void
}

export function WritingExerciseRow({
  index,
  exercise,
  lastAttempt,
  onDelete,
}: WritingExerciseRowProps) {
  const t = useTranslations('Writing')
  const locale = useLocale()
  const totalScore = lastAttempt
    ? Math.round((lastAttempt.grammar_score + lastAttempt.relevance_score) / 2)
    : null

  return (
    <tr className="group border-border hover:bg-muted/30 border-b transition-colors">
      <td className="text-muted-foreground py-3 pr-3 pl-4 text-center text-xs tabular-nums">
        {index}
      </td>

      <td className="py-3 pr-3 pl-4">
        <div className="relative size-10 overflow-hidden rounded-md">
          <Image
            src={exercise.image_url}
            alt={exercise.title}
            fill
            className="object-cover"
          />
        </div>
      </td>

      <td className="py-3 pr-3 pl-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-foreground line-clamp-1 text-sm font-medium">
            {exercise.title}
          </span>
          <div className="text-muted-foreground flex flex-wrap gap-1">
            {exercise.keywords.map((kw) => (
              <span
                key={kw}
                className="bg-muted rounded px-1.5 py-px text-[11px]"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </td>

      <td className="text-muted-foreground px-3 py-3 text-xs whitespace-nowrap">
        {formatDate(exercise.created_at, locale)}
      </td>

      <td className="px-3 py-3">
        {lastAttempt ? (
          <span className="inline-flex items-center rounded-md bg-emerald-400/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
            {t('attempted')}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">
            {t('notAttempted')}
          </span>
        )}
      </td>

      <td className="px-3 py-3">
        {totalScore !== null ? (
          <span
            className={cn(
              'text-xs font-semibold tabular-nums',
              scoreColor(totalScore),
            )}
          >
            {totalScore}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </td>

      <td className="py-3 pr-4 pl-3">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
            onClick={onDelete}
          >
            <Trash2 size={13} />
          </Button>
          <Link href={`/${locale}/admin/writing/${exercise.id}/edit`}>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground size-7 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Edit2 size={13} />
            </Button>
          </Link>
          <Link href={`/${locale}/admin/writing/${exercise.id}/practice`}>
            <Button
              variant={lastAttempt ? 'outline' : 'default'}
              size="sm"
              className="h-7 gap-1.5 text-xs"
            >
              <Eye size={12} />
              {lastAttempt ? t('review') : t('start')}
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  )
}

interface WritingExerciseCardProps {
  exercise: WritingExercise
  lastAttempt: WritingAttempt | undefined
  onDelete: () => void
}

export function WritingExerciseCard({
  exercise,
  lastAttempt,
  onDelete,
}: WritingExerciseCardProps) {
  const t = useTranslations('Writing')
  const locale = useLocale()
  const totalScore = lastAttempt
    ? Math.round((lastAttempt.grammar_score + lastAttempt.relevance_score) / 2)
    : null

  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-md">
        <Image
          src={exercise.image_url}
          alt={exercise.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-foreground line-clamp-2 text-sm leading-5 font-medium">
            {exercise.title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive size-6 shrink-0"
            onClick={onDelete}
          >
            <Trash2 size={13} />
          </Button>
        </div>

        <div className="mt-1 flex flex-wrap gap-1">
          {exercise.keywords.map((kw) => (
            <span
              key={kw}
              className="bg-muted text-muted-foreground rounded px-1.5 py-px text-[11px]"
            >
              {kw}
            </span>
          ))}
        </div>

        <div className="mt-1 flex items-center gap-2">
          {lastAttempt ? (
            <span className="rounded-md bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
              {t('attempted')}
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">
              {t('notAttempted')}
            </span>
          )}
          {totalScore !== null && (
            <span
              className={cn('text-xs font-semibold', scoreColor(totalScore))}
            >
              {t('score')}: {totalScore}
            </span>
          )}
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <Link href={`/${locale}/admin/writing/${exercise.id}/edit`}>
            <Button variant="outline" size="sm" className="h-8 w-full text-xs">
              <Edit2 size={12} className="mr-1" />
              {t('edit')}
            </Button>
          </Link>
          <Link href={`/${locale}/admin/writing/${exercise.id}/practice`}>
            <Button
              variant={lastAttempt ? 'outline' : 'default'}
              size="sm"
              className="h-8 w-full text-xs"
            >
              {lastAttempt ? t('review') : t('start')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
