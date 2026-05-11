'use client'

import { ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { SpeakButton } from '~/components/layout/speak-button'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { dayjs } from '~/lib/dayjs'

import type { Lesson, ReviewWord, Vocabulary } from '~/types'

const PAGE_SIZE = 20

type SortDir = 'asc' | 'desc'

function getDifficultyTier(d: number): 'easy' | 'medium' | 'hard' {
  if (d < 4) return 'easy'
  if (d <= 6) return 'medium'
  return 'hard'
}

function getNextReviewMs(dueAt: string | null | undefined): number {
  if (!dueAt) return Infinity
  return new Date(dueAt).getTime()
}

function NextReviewLabel({ dueAt }: { dueAt: string | null | undefined }) {
  const t = useTranslations('DashboardWords.table.nextReview')
  if (!dueAt) return <span className="text-muted-foreground">—</span>

  const diffDays = dayjs(dueAt).diff(dayjs(), 'day')

  if (diffDays < 0)
    return <span className="font-[510] text-red-400">{t('overdue')}</span>
  if (diffDays === 0)
    return (
      <span className="font-[510] text-yellow-400">
        {t('today')} {dayjs(dueAt).format('HH:mm')}
      </span>
    )
  return (
    <span className="text-muted-foreground tabular-nums">
      {dayjs(dueAt).format('DD/MM/YYYY')}
    </span>
  )
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  medium: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  hard: 'bg-red-500/20 text-red-300 border-red-500/40',
}

function DifficultyBadge({ difficulty }: { difficulty: number | undefined }) {
  const t = useTranslations('DashboardWords.table.difficulty')
  if (difficulty === undefined)
    return <span className="text-muted-foreground">—</span>

  const tier = getDifficultyTier(difficulty)

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] leading-none font-[510] ${DIFFICULTY_STYLES[tier]}`}
    >
      {t(tier)}
    </span>
  )
}

interface WordsMasteryTableProps {
  words: ReviewWord[]
  lessons: Lesson[]
  page: number
  isLoading: boolean
  onPageChange: (page: number) => void
  onRowClick: (voca: Vocabulary) => void
  renderRowActions?: (voca: Vocabulary) => React.ReactNode
}

export function WordsMasteryTable({
  words,
  lessons,
  page,
  isLoading,
  onPageChange,
  onRowClick,
  renderRowActions,
}: WordsMasteryTableProps) {
  const t = useTranslations('DashboardWords.table')
  const tCommon = useTranslations('Common')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const sorted = useMemo(
    () =>
      [...words].sort((a, b) => {
        const aMs = getNextReviewMs(a.progress?.due_at)
        const bMs = getNextReviewMs(b.progress?.due_at)
        return sortDir === 'asc' ? aMs - bMs : bMs - aMs
      }),
    [words, sortDir],
  )

  const lessonName = (id: string) =>
    lessons.find((l) => l.id === id)?.name ?? id
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const pageStart = (page - 1) * PAGE_SIZE
  const paginated = sorted.slice(pageStart, pageStart + PAGE_SIZE)
  const showActions = !!renderRowActions

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center justify-center py-20 text-sm">
        {tCommon('loading')}
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 px-4 text-center">
              {t('colNo')}
            </TableHead>
            <TableHead className="px-5">{t('colWord')}</TableHead>
            <TableHead className="px-4">{t('colMeaning')}</TableHead>
            <TableHead className="px-4">{t('colLesson')}</TableHead>
            <TableHead className="w-24 px-4">{t('colDifficulty')}</TableHead>
            <TableHead className="w-36 px-4">
              <button
                className="hover:text-foreground flex items-center gap-1 transition-colors"
                onClick={() =>
                  setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
                }
              >
                {t('colNextReview')}
                <ChevronsUpDown size={12} className="opacity-50" />
              </button>
            </TableHead>
            {showActions && <TableHead className="w-24 px-4" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((word, i) => (
            <TableRow
              key={word.id}
              className="cursor-pointer"
              onClick={() => onRowClick(word)}
            >
              <TableCell className="text-muted-foreground px-4 text-center text-xs">
                {pageStart + i + 1}
              </TableCell>

              <TableCell className="px-5">
                <div className="flex items-start gap-2">
                  <div
                    className="mt-0.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SpeakButton text={word.word} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold">{word.word}</span>
                      {word.word_type && (
                        <Badge
                          variant="outline"
                          className="h-4 px-1.5 py-0 text-[10px] font-normal"
                        >
                          {word.word_type}
                        </Badge>
                      )}
                    </div>
                    {word.phonetic && (
                      <span className="text-muted-foreground font-mono text-xs">
                        {word.phonetic}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell className="max-w-xs px-4">
                <span className="line-clamp-2 text-sm">{word.meaning}</span>
              </TableCell>

              <TableCell className="text-muted-foreground px-4 text-sm">
                {lessonName(word.lesson_id)}
              </TableCell>

              <TableCell className="px-4">
                <DifficultyBadge difficulty={word.progress?.difficulty} />
              </TableCell>

              <TableCell className="px-4 text-xs whitespace-nowrap">
                <NextReviewLabel dueAt={word.progress?.due_at} />
              </TableCell>

              {showActions && (
                <TableCell
                  className="px-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {renderRowActions(word)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-5 py-3">
          <span className="text-muted-foreground text-xs">
            {t('pageOf', { current: page, total: totalPages })}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
