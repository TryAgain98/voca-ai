'use client'

import { useUser } from '@clerk/nextjs'
import { useParams, useRouter } from 'next/navigation'

import { useDashboardStats } from '~/hooks/use-word-mastery'
import { useReviewQuickStartStore } from '~/stores/review-quick-start'

import type { ReviewWord } from '~/types'
import type { ReviewVocab } from '~admin/review/_types/review.types'

const PRACTICE_LIMIT = 20

function toReviewVocab(word: ReviewWord): ReviewVocab {
  return {
    id: word.id,
    word: word.word,
    meaning: word.meaning,
    word_type: word.word_type,
    phonetic: word.phonetic,
    example: word.example,
    description: word.description,
    synonyms: word.synonyms,
  }
}

interface UseSlippedTodayFilterResult {
  wrongTodayCount: number
  wrongTodayIds: Set<string> | null
  onPracticeNow: () => void
}

export function useSlippedTodayFilter(
  isEnabled: boolean,
): UseSlippedTodayFilterResult {
  const { user } = useUser()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const setPendingReview = useReviewQuickStartStore((s) => s.setPendingVocab)

  const { data: dashboardStats } = useDashboardStats(user?.id ?? '')

  const wrongTodayWords = isEnabled ? dashboardStats?.wrongTodayWords : null
  const wrongTodayIds = wrongTodayWords?.length
    ? new Set(wrongTodayWords.map((w) => w.id))
    : null

  const onPracticeNow = () => {
    if (!dashboardStats?.wrongTodayWords?.length) return
    setPendingReview(
      dashboardStats.wrongTodayWords
        .slice(0, PRACTICE_LIMIT)
        .map(toReviewVocab),
    )
    router.push(`/${locale}/admin/review`)
  }

  return {
    wrongTodayCount: dashboardStats?.wrongTodayCount ?? 0,
    wrongTodayIds,
    onPracticeNow,
  }
}
