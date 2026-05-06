'use client'

import { useUser } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'

import { useDashboardStats } from '~/hooks/use-word-review-progress'

import { WordsReviewView } from './_components/words-review-view'

import type { WordsViewType } from './_components/words-review-view'

function parseType(value: string | null): WordsViewType {
  return value === 'due' ? 'due' : 'unlearned'
}

export default function DashboardWordsPage() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const type = parseType(searchParams.get('type'))

  const { data: stats, isLoading } = useDashboardStats(user?.id ?? '')

  const words =
    type === 'unlearned'
      ? (stats?.unlearnedWords ?? [])
      : (stats?.dueTodayWords ?? [])

  return (
    <div className="mx-auto max-w-5xl">
      <WordsReviewView type={type} words={words} isLoading={isLoading} />
    </div>
  )
}
