'use client'

import { useUser } from '@clerk/nextjs'

import { useDashboardStats } from '~/hooks/use-word-mastery'

import type { ReviewWord } from '~/types'
import type { ReviewVocab } from '~admin/review/_types/review.types'

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
  wrongTodayVocab: ReviewVocab[]
}

export function useSlippedTodayFilter(
  isEnabled: boolean,
): UseSlippedTodayFilterResult {
  const { user } = useUser()

  const { data: dashboardStats } = useDashboardStats(user?.id ?? '')

  const wrongTodayWords = isEnabled ? dashboardStats?.wrongTodayWords : null
  const wrongTodayIds = wrongTodayWords?.length
    ? new Set(wrongTodayWords.map((w) => w.id))
    : null

  const wrongTodayVocab =
    dashboardStats?.wrongTodayWords?.map(toReviewVocab) ?? []

  return {
    wrongTodayCount: dashboardStats?.wrongTodayCount ?? 0,
    wrongTodayIds,
    wrongTodayVocab,
  }
}
