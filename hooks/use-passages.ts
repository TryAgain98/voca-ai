'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { passagesService } from '~/services/passages.service'

import type { PassageInsert } from '~/types'

export function usePassages() {
  return useQuery({
    queryKey: ['passages'],
    queryFn: () => passagesService.findAll(),
  })
}

export function usePassage(id: string) {
  return useQuery({
    queryKey: ['passages', 'detail', id],
    queryFn: () => passagesService.findById(id),
    enabled: !!id,
  })
}

export function useCreatePassage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PassageInsert) => passagesService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['passages'] })
    },
    onError: () => toast.error('Không thể lưu đoạn văn'),
  })
}

export function useDeletePassage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => passagesService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['passages'] })
      toast.success('Đã xóa đoạn văn')
    },
    onError: () => toast.error('Không thể xóa đoạn văn'),
  })
}
