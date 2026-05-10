'use client'

import { useUser } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'

import { useDashboardStats } from '~/hooks/use-word-mastery'

import { WordsReviewView } from './_components/words-review-view'

export default function DashboardWordsPage() {
  const { user } = useUser()
  const searchParams = useSearchParams()

  const viewAs = searchParams.get('viewAs') ?? ''
  const isViewMode = !!viewAs
  const userId = viewAs || user?.id || ''

  const { data: stats, isLoading } = useDashboardStats(userId)

  return (
    <div className="mx-auto max-w-5xl">
      <WordsReviewView
        untouchedWords={stats?.unlearnedWords ?? []}
        practicingWords={stats?.practicingWords ?? []}
        masteredWords={stats?.masteredWords ?? []}
        isLoading={isLoading}
        isViewMode={isViewMode}
        viewAs={viewAs || undefined}
      />
    </div>
  )
}
