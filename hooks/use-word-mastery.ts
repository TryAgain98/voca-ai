import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { wordMasteryService } from '~/services/word-mastery.service'

import type { QuizWordResult } from '~/services/word-mastery.service'

export { type DashboardStats } from '~/services/word-mastery.service'

const QUERY_KEY = 'word-mastery'

interface UseReviewWordsParams {
  userId: string
  lessonIds: string[]
  limit?: number
  enabled?: boolean
}

export function useReviewWords({
  userId,
  lessonIds,
  limit = 50,
  enabled = true,
}: UseReviewWordsParams) {
  return useQuery({
    queryKey: [QUERY_KEY, 'words', userId, lessonIds, limit],
    queryFn: () => wordMasteryService.getReviewWords(userId, lessonIds, limit),
    enabled: enabled && !!userId && lessonIds.length > 0,
  })
}

export function useDashboardStats(userId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'dashboard', userId],
    queryFn: () => wordMasteryService.getDashboardStats(userId),
    enabled: !!userId,
  })
}

interface UseQuizCandidatesParams {
  userId: string
  lessonIds: string[]
  limit?: number
  enabled?: boolean
}

export function useQuizCandidates({
  userId,
  lessonIds,
  limit = 20,
  enabled = true,
}: UseQuizCandidatesParams) {
  return useQuery({
    queryKey: [QUERY_KEY, 'quiz-candidates', userId, lessonIds, limit],
    queryFn: () =>
      wordMasteryService.getQuizCandidates(userId, lessonIds, limit),
    enabled: enabled && !!userId,
  })
}

interface ApplyMasteryParams {
  userId: string
  results: QuizWordResult[]
}

export function useApplyQuizMastery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, results }: ApplyMasteryParams) =>
      wordMasteryService.applyQuizMastery(userId, results),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

interface SoftDemoteParams {
  userId: string
  wordId: string
}

export function useSoftDemoteMastery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, wordId }: SoftDemoteParams) =>
      wordMasteryService.softDemoteMastery(userId, wordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}
