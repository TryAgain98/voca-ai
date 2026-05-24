'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { passageSessionsService } from '~/services/passage-sessions.service'

import type { PassageSessionInsert } from '~/types'

export function usePassageSessions(passageId: string) {
  return useQuery({
    queryKey: ['passage-sessions', passageId],
    queryFn: () => passageSessionsService.findByPassage(passageId),
    enabled: !!passageId,
  })
}

export function useLatestExamsByUser(userId: string) {
  return useQuery({
    queryKey: ['passage-sessions', 'exam-summary', userId],
    queryFn: () => passageSessionsService.findLatestExamByUser(userId),
    enabled: !!userId,
  })
}

export function useCreatePassageSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PassageSessionInsert) =>
      passageSessionsService.create(payload),
    onSuccess: (_, vars) => {
      void qc.invalidateQueries({
        queryKey: ['passage-sessions', vars.passage_id],
      })
      void qc.invalidateQueries({
        queryKey: ['passage-sessions', 'exam-summary', vars.user_id],
      })
    },
    onError: () => toast.error('Không thể lưu kết quả'),
  })
}
