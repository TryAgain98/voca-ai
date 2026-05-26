'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { logAppError } from '~/services/app-error-log.service'
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

export function useQuizPerformance(userId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'performance', userId],
    queryFn: () => quizSessionService.getPerformanceStats(userId),
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
      qc.invalidateQueries({
        queryKey: [QUERY_KEY, 'performance', data.user_id],
      })
    },
    onError: (error, payload) => {
      console.error('[quiz-session] failed to save quiz session', {
        error,
        payload,
      })
      logAppError({
        source: 'quiz-session',
        action: 'save',
        error,
        userId: payload.user_id,
        details: { payload },
      })
      toast.error('Failed to save quiz session')
    },
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
    onError: (error, vars) => {
      console.error('[quiz-session] failed to delete quiz session', {
        error,
        vars,
      })
      logAppError({
        source: 'quiz-session',
        action: 'delete',
        error,
        userId: vars.userId,
        details: { id: vars.id },
      })
      toast.error('Failed to delete session')
    },
  })
}
