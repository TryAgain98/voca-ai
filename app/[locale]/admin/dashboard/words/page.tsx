'use client'

import { useUser } from '@clerk/nextjs'

import { useDashboardStats } from '~/hooks/use-word-mastery'

import { WordsReviewView } from './_components/words-review-view'

export default function DashboardWordsPage() {
  const { user } = useUser()
  const { data: stats, isLoading } = useDashboardStats(user?.id ?? '')

  return (
    <div className="mx-auto max-w-5xl">
      <WordsReviewView
        untouchedWords={stats?.unlearnedWords ?? []}
        practicingWords={stats?.practicingWords ?? []}
        masteredWords={stats?.masteredWords ?? []}
        isLoading={isLoading}
      />
    </div>
  )
}
