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

export function useCreatePassageSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PassageSessionInsert) =>
      passageSessionsService.create(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['passage-sessions', vars.passage_id] })
    },
    onError: () => toast.error('Không thể lưu kết quả'),
  })
}
