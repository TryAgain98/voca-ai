'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { lessonsService } from '~/services/lessons.service'

export function useLessons() {
  return useQuery({
    queryKey: ['lessons'],
    queryFn: () => lessonsService.findAll(),
  })
}

export function useCreateLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      lessonsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lessons'] })
      toast.success('Lesson created')
    },
    onError: () => toast.error('Failed to create lesson'),
  })
}

export function useUpdateLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string
      name: string
      description?: string
    }) => lessonsService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lessons'] })
      toast.success('Lesson updated')
    },
    onError: () => toast.error('Failed to update lesson'),
  })
}

export function useDeleteLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => lessonsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lessons'] })
      toast.success('Lesson deleted')
    },
    onError: () => toast.error('Failed to delete lesson'),
  })
}
