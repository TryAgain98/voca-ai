'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { writingExercisesService } from '~/services/writing-exercises.service'

import type { WritingExerciseInsert, WritingExerciseUpdate } from '~/types'

export function useWritingExercises(userId?: string) {
  return useQuery({
    queryKey: ['writing-exercises', userId],
    queryFn: () =>
      userId
        ? writingExercisesService.findByUser(userId)
        : writingExercisesService.findAll(),
    enabled: true,
  })
}

export function useWritingExercise(id: string) {
  return useQuery({
    queryKey: ['writing-exercises', 'detail', id],
    queryFn: () => writingExercisesService.findById(id),
    enabled: !!id,
  })
}

export function useCreateWritingExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: WritingExerciseInsert) =>
      writingExercisesService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['writing-exercises'] })
    },
    onError: () => toast.error('Không thể tạo bài viết'),
  })
}

export function useUpdateWritingExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: WritingExerciseUpdate
    }) => writingExercisesService.update(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['writing-exercises'] })
      qc.invalidateQueries({ queryKey: ['writing-exercises', 'detail', id] })
    },
    onError: () => toast.error('Không thể cập nhật bài viết'),
  })
}

export function useDeleteWritingExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, imageUrl }: { id: string; imageUrl: string }) => {
      await writingExercisesService.deleteImage(imageUrl)
      await writingExercisesService.delete(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['writing-exercises'] })
      toast.success('Đã xóa bài viết')
    },
    onError: () => toast.error('Không thể xóa bài viết'),
  })
}

export function useUploadWritingImage() {
  return useMutation({
    mutationFn: ({ file, userId }: { file: File; userId: string }) =>
      writingExercisesService.uploadImage(file, userId),
    onError: () => toast.error('Không thể tải ảnh lên'),
  })
}
