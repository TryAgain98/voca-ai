'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { vocabulariesService } from '~/services/vocabularies.service'

export function useVocabularies(lessonId?: string) {
  return useQuery({
    queryKey: ['vocabularies', lessonId],
    queryFn: () =>
      lessonId
        ? vocabulariesService.findByLessonId(lessonId)
        : vocabulariesService.findAll(),
    enabled: true,
  })
}

export function useCreateVocabulary() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      lesson_id: string
      word: string
      meaning: string
      example?: string
    }) => vocabulariesService.create(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['vocabularies', vars.lesson_id] })
      qc.invalidateQueries({ queryKey: ['vocabularies'] })
      toast.success('Vocabulary created')
    },
    onError: () => toast.error('Failed to create vocabulary'),
  })
}

export function useUpdateVocabulary() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: {
      id: string
      lessonId: string
      word: string
      meaning: string
      example?: string
    }) =>
      vocabulariesService.update(vars.id, {
        word: vars.word,
        meaning: vars.meaning,
        example: vars.example,
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['vocabularies', vars.lessonId] })
      qc.invalidateQueries({ queryKey: ['vocabularies'] })
      toast.success('Vocabulary updated')
    },
    onError: () => toast.error('Failed to update vocabulary'),
  })
}

export function useDeleteVocabulary() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; lessonId: string }) =>
      vocabulariesService.delete(id),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['vocabularies', vars.lessonId] })
      qc.invalidateQueries({ queryKey: ['vocabularies'] })
      toast.success('Vocabulary deleted')
    },
    onError: () => toast.error('Failed to delete vocabulary'),
  })
}
