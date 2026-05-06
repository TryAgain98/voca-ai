import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { wordReviewProgressService } from '~/services/word-review-progress.service'

import type { QuizWordResult } from '~/services/word-review-progress.service'

export { type DashboardStats } from '~/services/word-review-progress.service'

const QUERY_KEY = 'word-review-progress'

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
    queryFn: () =>
      wordReviewProgressService.getReviewWords(userId, lessonIds, limit),
    enabled: enabled && !!userId && lessonIds.length > 0,
  })
}

export function useDashboardStats(userId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'dashboard', userId],
    queryFn: () => wordReviewProgressService.getDashboardStats(userId),
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
      wordReviewProgressService.getQuizCandidates(userId, lessonIds, limit),
    enabled: enabled && !!userId,
  })
}

interface SubmitAnswerParams {
  userId: string
  wordId: string
  isCorrect: boolean
}

export function useSubmitAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, wordId, isCorrect }: SubmitAnswerParams) =>
      wordReviewProgressService.upsertAfterAnswer(userId, wordId, isCorrect),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
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
      wordReviewProgressService.applyQuizMastery(userId, results),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}
