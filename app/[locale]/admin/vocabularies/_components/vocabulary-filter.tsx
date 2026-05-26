'use client'

import { SlidersHorizontal, Sparkles, Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '~/components/ui/select'

import type { Lesson, MasteryStatus } from '~/types'

const ALL = 'all'

interface VocabularyFilterProps {
  lessons: Lesson[]
  lessonFilter: string
  searchQuery: string
  statusFilter: MasteryStatus | 'all'
  isSlippedTodayFilter: boolean
  onLessonChange: (value: string) => void
  onSearchChange: (value: string) => void
  onStatusChange: (value: MasteryStatus | 'all') => void
  onSlippedTodayChange: (value: boolean) => void
  onClearFilters: () => void
}

export function VocabularyFilter({
  lessons,
  lessonFilter,
  searchQuery,
  statusFilter,
  isSlippedTodayFilter,
  onLessonChange,
  onSearchChange,
  onStatusChange,
  onSlippedTodayChange,
  onClearFilters,
}: VocabularyFilterProps) {
  const t = useTranslations('Vocabularies')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const isFiltering =
    lessonFilter !== ALL ||
    searchQuery.trim() !== '' ||
    statusFilter !== ALL ||
    isSlippedTodayFilter
  const selectedLesson = lessons.find((l) => l.id === lessonFilter)
  const activeFilterCount = [
    lessonFilter !== ALL,
    statusFilter !== ALL,
    isSlippedTodayFilter,
  ].filter(Boolean).length

  const activeChips = (
    <div className="flex flex-wrap items-center gap-2 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:pb-1">
      <span className="text-muted-foreground shrink-0 text-xs max-sm:hidden">
        {t('filteringBy')}
      </span>

      {selectedLesson && (
        <Badge
          variant="secondary"
          className="cursor-default gap-1 pr-1 text-xs font-normal"
        >
          {selectedLesson.name}
          <button
            type="button"
            onClick={() => onLessonChange(ALL)}
            className="hover:bg-muted rounded-sm p-0.5"
          >
            <X size={10} />
          </button>
        </Badge>
      )}

      {isSlippedTodayFilter && (
        <Badge
          variant="secondary"
          className="cursor-default gap-1 border-amber-500/30 bg-amber-500/10 pr-1 text-xs font-normal text-amber-600 dark:text-amber-400"
        >
          {t('filterSlippedToday')}
          <button
            type="button"
            onClick={() => onSlippedTodayChange(false)}
            className="hover:bg-muted rounded-sm p-0.5"
          >
            <X size={10} />
          </button>
        </Badge>
      )}

      {statusFilter !== ALL && (
        <Badge
          variant="secondary"
          className="cursor-default gap-1 pr-1 text-xs font-normal"
        >
          {t(
            `status${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}` as Parameters<
              typeof t
            >[0],
          )}
          <button
            type="button"
            onClick={() => onStatusChange(ALL)}
            className="hover:bg-muted rounded-sm p-0.5"
          >
            <X size={10} />
          </button>
        </Badge>
      )}

      {searchQuery.trim() && (
        <Badge
          variant="secondary"
          className="cursor-default gap-1 pr-1 text-xs font-normal"
        >
          &ldquo;{searchQuery}&rdquo;
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="hover:bg-muted rounded-sm p-0.5"
          >
            <X size={10} />
          </button>
        </Badge>
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClearFilters}
        className="text-muted-foreground hover:text-foreground h-auto shrink-0 px-1 py-0 text-xs"
      >
        {t('clearFilters')}
      </Button>
    </div>
  )

  return (
    <div className="space-y-2">
      <div className="space-y-1.5 sm:hidden">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              size={14}
              className="text-muted-foreground absolute top-1/2 left-2.5 -translate-y-1/2"
            />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 pr-8 pl-8"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <Button
            type="button"
            variant={mobileFiltersOpen ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => setMobileFiltersOpen((open) => !open)}
            className="relative"
            title={t('filterStatus')}
          >
            <SlidersHorizontal size={16} />
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {mobileFiltersOpen && (
          <div className="grid grid-cols-2 gap-2 rounded-lg border bg-white/2 p-2">
            <Select
              value={lessonFilter}
              onValueChange={(v) => v && onLessonChange(v)}
            >
              <SelectTrigger className="col-span-2 w-full">
                <span className="flex flex-1 truncate text-left text-sm">
                  {lessonFilter === ALL
                    ? t('filterLesson')
                    : (selectedLesson?.name ?? t('filterLesson'))}
                </span>
              </SelectTrigger>
              <SelectContent
                alignItemWithTrigger={false}
                className="w-fit max-w-[min(420px,calc(100vw-2rem))] min-w-(--anchor-width)"
              >
                <SelectItem value={ALL}>{t('filterLesson')}</SelectItem>
                {lessons.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(v) =>
                v && onStatusChange(v as MasteryStatus | 'all')
              }
            >
              <SelectTrigger className="w-full">
                <span className="flex flex-1 truncate text-left text-sm">
                  {statusFilter === ALL
                    ? t('filterStatus')
                    : t(
                        `status${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}` as Parameters<
                          typeof t
                        >[0],
                      )}
                </span>
              </SelectTrigger>
              <SelectContent className="w-fit min-w-(--anchor-width)">
                <SelectItem value={ALL}>{t('filterStatus')}</SelectItem>
                <SelectItem value="mastered">{t('statusMastered')}</SelectItem>
                <SelectItem value="practicing">
                  {t('statusPracticing')}
                </SelectItem>
                <SelectItem value="untested">{t('statusUntested')}</SelectItem>
              </SelectContent>
            </Select>

            <button
              type="button"
              onClick={() => onSlippedTodayChange(!isSlippedTodayFilter)}
              className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-[510] transition-colors ${
                isSlippedTodayFilter
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-border text-muted-foreground hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              <Sparkles size={13} strokeWidth={1.8} />
              {t('filterSlippedToday')}
            </button>
          </div>
        )}
      </div>

      <div className="hidden flex-wrap items-center gap-3 sm:flex">
        <Select
          value={lessonFilter}
          onValueChange={(v) => v && onLessonChange(v)}
        >
          <SelectTrigger className="w-52">
            <span className="flex flex-1 truncate text-left text-sm">
              {lessonFilter === ALL
                ? t('filterLesson')
                : (selectedLesson?.name ?? t('filterLesson'))}
            </span>
          </SelectTrigger>
          <SelectContent
            alignItemWithTrigger={false}
            className="w-fit max-w-[min(420px,calc(100vw-2rem))] min-w-(--anchor-width)"
          >
            <SelectItem value={ALL}>{t('filterLesson')}</SelectItem>
            {lessons.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => v && onStatusChange(v as MasteryStatus | 'all')}
        >
          <SelectTrigger className="w-[calc(50%-0.375rem)] min-w-36 sm:w-44">
            <span className="flex flex-1 truncate text-left text-sm">
              {statusFilter === ALL
                ? t('filterStatus')
                : t(
                    `status${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}` as Parameters<
                      typeof t
                    >[0],
                  )}
            </span>
          </SelectTrigger>
          <SelectContent className="w-fit min-w-(--anchor-width)">
            <SelectItem value={ALL}>{t('filterStatus')}</SelectItem>
            <SelectItem value="mastered">{t('statusMastered')}</SelectItem>
            <SelectItem value="practicing">{t('statusPracticing')}</SelectItem>
            <SelectItem value="untested">{t('statusUntested')}</SelectItem>
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={() => onSlippedTodayChange(!isSlippedTodayFilter)}
          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-[510] transition-colors ${
            isSlippedTodayFilter
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : 'border-border text-muted-foreground hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-600 dark:hover:text-amber-400'
          }`}
        >
          <Sparkles size={13} strokeWidth={1.8} />
          {t('filterSlippedToday')}
        </button>

        <div className="relative max-w-sm flex-1">
          <Search
            size={14}
            className="text-muted-foreground absolute top-1/2 left-2.5 -translate-y-1/2"
          />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-8 pl-8"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {isFiltering && activeChips}
    </div>
  )
}
