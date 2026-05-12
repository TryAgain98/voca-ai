'use client'

import { useTranslations } from 'next-intl'

import { TAB_VISUALS } from '../_types/words-review.types'

import { WordsMasteryTable } from './words-mastery-table'
import { TabEmptyState } from './words-review-states'

import type { TabKey } from '../_types/words-review.types'
import type { ReactNode } from 'react'
import type { Lesson, ReviewWord } from '~/types'

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
  onRowClick: (voca: ReviewWord) => void
  onUnmaster: (voca: ReviewWord) => void
  renderRowActions?: (voca: ReviewWord) => ReactNode
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
  renderRowActions: renderRowActionsProp,
}: WordsReviewContentProps) {
  const t = useTranslations('DashboardWords')
  const visual = TAB_VISUALS[activeTab]

  const renderRowActions =
    renderRowActionsProp !== undefined
      ? renderRowActionsProp
      : activeTab === 'mastered'
        ? (voca: ReviewWord) => (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex h-7 items-center gap-1.5 rounded border border-white/6 px-2 text-xs"
              onClick={() => onUnmaster(voca)}
              disabled={isUnmasterPending}
            >
              {t('actions.unmaster')}
            </button>
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
