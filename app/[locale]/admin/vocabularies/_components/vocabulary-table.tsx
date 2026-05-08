'use client'

import {
  BookMarked,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

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

import type { Lesson, Vocabulary } from '~/types'

export const PAGE_SIZE = 20

interface VocabularyTableProps {
  vocabularies: Vocabulary[]
  lessons: Lesson[]
  searchQuery: string
  isLoading: boolean
  isFiltering: boolean
  page: number
  onPageChange: (page: number) => void
  onRowClick: (voca: Vocabulary) => void
  onEdit?: (voca: Vocabulary) => void
  onDelete?: (voca: Vocabulary) => void
  renderRowActions?: (voca: Vocabulary) => React.ReactNode
  onClearFilters: () => void
}

function formatDate(
  primary: string | null | undefined,
  fallback?: string | null,
): string {
  const target = primary || fallback
  if (!target) return '—'
  const d = dayjs(target)
  if (!d.isValid()) return '—'
  return d.format('DD/MM/YYYY')
}

function highlight(text: string, query: string) {
  if (!query.trim()) return <>{text}</>
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi',
  )
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="rounded-sm bg-yellow-200/70 px-0.5 dark:bg-yellow-800/60"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

export function VocabularyTable({
  vocabularies,
  lessons,
  searchQuery,
  isLoading,
  isFiltering,
  page,
  onPageChange,
  onRowClick,
  onEdit,
  onDelete,
  renderRowActions,
  onClearFilters,
}: VocabularyTableProps) {
  const t = useTranslations('Vocabularies')
  const tCommon = useTranslations('Common')

  const totalPages = Math.max(1, Math.ceil(vocabularies.length / PAGE_SIZE))
  const pageStart = (page - 1) * PAGE_SIZE
  const paginated = vocabularies.slice(pageStart, pageStart + PAGE_SIZE)
  const showActions = !!onEdit || !!onDelete || !!renderRowActions

  const lessonName = (id: string): string =>
    lessons.find((l) => l.id === id)?.name ?? id

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center justify-center py-20 text-sm">
        {tCommon('loading')}
      </div>
    )
  }

  if (vocabularies.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-20">
        <BookMarked size={36} className="opacity-30" />
        <p className="text-sm">
          {isFiltering ? t('emptyFiltered') : t('emptyAll')}
        </p>
        {isFiltering && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            {t('clearFilters')}
          </Button>
        )}
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
            <TableHead className="w-28 px-4">{t('colUpdated')}</TableHead>
            {showActions && <TableHead className="w-24 px-4" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((voca, i) => (
            <TableRow
              key={voca.id}
              className="cursor-pointer"
              onClick={() => onRowClick(voca)}
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
                    <SpeakButton text={voca.word} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold">
                        {highlight(voca.word, searchQuery)}
                      </span>
                      {voca.word_type && (
                        <Badge
                          variant="outline"
                          className="h-4 px-1.5 py-0 text-[10px] font-normal"
                        >
                          {voca.word_type}
                        </Badge>
                      )}
                    </div>
                    {voca.phonetic && (
                      <span className="text-muted-foreground font-mono text-xs">
                        {voca.phonetic}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell className="max-w-xs px-4">
                <span className="line-clamp-2 text-sm">
                  {highlight(voca.meaning, searchQuery)}
                </span>
              </TableCell>

              <TableCell className="text-muted-foreground px-4 text-sm">
                {lessonName(voca.lesson_id)}
              </TableCell>

              <TableCell className="text-muted-foreground px-4 text-xs whitespace-nowrap">
                {formatDate(voca.updated_at, voca.created_at)}
              </TableCell>

              {showActions && (
                <TableCell
                  className="px-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {renderRowActions ? (
                    renderRowActions(voca)
                  ) : (
                    <div className="inline-flex cursor-pointer items-center rounded-md border border-white/8 bg-white/2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title={tCommon('edit')}
                          className="rounded-r-none"
                          onClick={() => onEdit(voca)}
                        >
                          <Pencil size={13} />
                        </Button>
                      )}
                      {onEdit && onDelete && (
                        <div className="h-4 w-px bg-white/8" />
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive rounded-l-none"
                          title={tCommon('delete')}
                          onClick={() => onDelete(voca)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      )}
                    </div>
                  )}
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
