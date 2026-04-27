'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('Vocabularies')
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
      toast.success(t('createSuccess'))
    },
    onError: () => toast.error(t('createError')),
  })
}

export function useUpdateVocabulary() {
  const t = useTranslations('Vocabularies')
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
      toast.success(t('updateSuccess'))
    },
    onError: () => toast.error(t('updateError')),
  })
}

export function useBulkCreateVocabularies() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (items: Parameters<typeof vocabulariesService.bulkCreate>[0]) =>
      vocabulariesService.bulkCreate(items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vocabularies'] })
    },
    onError: () => toast.error('Failed to import vocabularies'),
  })
}

export function useDeleteVocabulary() {
  const t = useTranslations('Vocabularies')
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; lessonId: string }) =>
      vocabulariesService.delete(id),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['vocabularies', vars.lessonId] })
      qc.invalidateQueries({ queryKey: ['vocabularies'] })
      toast.success(t('deleteSuccess'))
    },
    onError: () => toast.error(t('deleteError')),
  })
}
