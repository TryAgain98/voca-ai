'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { quizSessionService } from '~/services/quiz-session.service'

import type { QuizSessionInsert } from '~/types'

const QUERY_KEY = 'quiz-sessions'

export function useQuizSessions(userId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, userId],
    queryFn: () => quizSessionService.findByUserId(userId),
    enabled: !!userId,
  })
}

export function useSaveQuizSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: QuizSessionInsert) =>
      quizSessionService.create(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY, data.user_id] })
    },
    onError: () => toast.error('Failed to save quiz session'),
  })
}

export function useDeleteQuizSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; userId: string }) =>
      quizSessionService.delete(id),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY, vars.userId] })
      toast.success('Session deleted')
    },
    onError: () => toast.error('Failed to delete session'),
  })
}
