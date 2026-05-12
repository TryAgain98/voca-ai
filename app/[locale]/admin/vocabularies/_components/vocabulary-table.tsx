'use client'

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BookMarked,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'

import { VocabularyTableRow } from './vocabulary-table-row'

import type { Lesson, VocabWithMastery } from '~/types'

export const PAGE_SIZE = 20

interface VocabularyTableProps {
  vocabularies: VocabWithMastery[]
  lessons: Lesson[]
  searchQuery: string
  isLoading: boolean
  isFiltering: boolean
  sortByDue: 'asc' | 'desc' | null
  page: number
  onPageChange: (page: number) => void
  onSortByDueChange: (value: 'asc' | 'desc' | null) => void
  onRowClick: (voca: VocabWithMastery) => void
  onEdit?: (voca: VocabWithMastery) => void
  onDelete?: (voca: VocabWithMastery) => void
  renderRowActions?: (voca: VocabWithMastery) => React.ReactNode
  onClearFilters: () => void
}

export function VocabularyTable({
  vocabularies,
  lessons,
  searchQuery,
  isLoading,
  isFiltering,
  sortByDue,
  page,
  onPageChange,
  onSortByDueChange,
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

  const lessonName = (id: string) =>
    lessons.find((l) => l.id === id)?.name ?? id

  const handleDueSort = () => {
    const next =
      sortByDue === null ? 'desc' : sortByDue === 'desc' ? 'asc' : null
    onSortByDueChange(next)
  }

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
            <TableHead className="w-32 px-4">{t('colStatus')}</TableHead>
            <TableHead className="w-28 px-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-default">
                    {t('colLevel')}
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {t('colLevelTooltip')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead
              className="w-28 cursor-pointer px-4 select-none"
              onClick={handleDueSort}
            >
              <div className="flex items-center gap-1">
                {t('colDue')}
                {sortByDue === 'asc' ? (
                  <ArrowUp size={12} className="text-foreground" />
                ) : sortByDue === 'desc' ? (
                  <ArrowDown size={12} className="text-foreground" />
                ) : (
                  <ArrowUpDown size={12} className="text-muted-foreground/40" />
                )}
              </div>
            </TableHead>
            {showActions && <TableHead className="w-24 px-4" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((voca, i) => (
            <VocabularyTableRow
              key={voca.id}
              voca={voca}
              rowNumber={pageStart + i + 1}
              searchQuery={searchQuery}
              lessonName={lessonName(voca.lesson_id)}
              showActions={showActions}
              onRowClick={onRowClick}
              onEdit={onEdit}
              onDelete={onDelete}
              renderRowActions={renderRowActions}
            />
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
