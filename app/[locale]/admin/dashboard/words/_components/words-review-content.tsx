'use client'

import { RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'

import { TAB_VISUALS } from '../_types/words-review.types'

import { WordsMasteryTable } from './words-mastery-table'
import { TabEmptyState } from './words-review-states'

import type { TabKey } from '../_types/words-review.types'
import type { Lesson, ReviewWord, Vocabulary } from '~/types'

interface WordsReviewContentProps {
  activeTab: TabKey
  description: string
  words: ReviewWord[]
  lessons: Lesson[]
  page: number
  isLoading: boolean
  sourceIsEmpty: boolean
  isUnmasterPending: boolean
  onPageChange: (page: number) => void
  onRowClick: (voca: Vocabulary) => void
  onUnmaster: (voca: Vocabulary) => void
}

export function WordsReviewContent({
  activeTab,
  description,
  words,
  lessons,
  page,
  isLoading,
  sourceIsEmpty,
  isUnmasterPending,
  onPageChange,
  onRowClick,
  onUnmaster,
}: WordsReviewContentProps) {
  const t = useTranslations('DashboardWords')
  const visual = TAB_VISUALS[activeTab]

  const renderRowActions =
    activeTab === 'mastered'
      ? (voca: Vocabulary) => (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-muted h-7 gap-1.5 border border-white/[0.06] text-xs"
            onClick={() => onUnmaster(voca)}
            disabled={isUnmasterPending}
          >
            <RotateCcw size={11} />
            {t('actions.unmaster')}
          </Button>
        )
      : undefined

  return (
    <div className="space-y-3 pt-1">
      <p className="text-muted-foreground px-1 text-sm leading-relaxed">
        {description}
      </p>

      {sourceIsEmpty && !isLoading ? (
        <TabEmptyState
          visual={visual}
          message={t(`empty.${activeTab}` as const)}
        />
      ) : (
        <div className="border-border bg-card/40 overflow-hidden rounded-xl border">
          <WordsMasteryTable
            words={words}
            lessons={lessons}
            isLoading={isLoading}
            page={page}
            onPageChange={onPageChange}
            onRowClick={onRowClick}
            renderRowActions={renderRowActions}
          />
        </div>
      )}
    </div>
  )
}
