'use client'

import { Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '~/components/ui/select'

import type { Lesson } from '~/types'

const ALL = 'all'

interface VocabularyFilterProps {
  lessons: Lesson[]
  lessonFilter: string
  searchQuery: string
  onLessonChange: (value: string) => void
  onSearchChange: (value: string) => void
  onClearFilters: () => void
}

export function VocabularyFilter({
  lessons,
  lessonFilter,
  searchQuery,
  onLessonChange,
  onSearchChange,
  onClearFilters,
}: VocabularyFilterProps) {
  const t = useTranslations('Vocabularies')

  const isFiltering = lessonFilter !== ALL || searchQuery.trim() !== ''
  const selectedLesson = lessons.find((l) => l.id === lessonFilter)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
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
          <SelectContent>
            <SelectItem value={ALL}>{t('filterLesson')}</SelectItem>
            {lessons.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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

      {isFiltering && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs">
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
            className="text-muted-foreground hover:text-foreground h-auto px-1 py-0 text-xs"
          >
            {t('clearFilters')}
          </Button>
        </div>
      )}
    </div>
  )
}
