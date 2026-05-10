'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { vocabulariesService } from '~/services/vocabularies.service'

import type { Vocabulary } from '~/types'

function fireSynonymSync(
  body: { vocab: Vocabulary } | { vocabs: Vocabulary[] } | { vocabId: string },
): Promise<void> {
  return fetch('/api/vocab/sync-synonyms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then(() => {})
    .catch(() => {})
}

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

export function useVocabulariesByLessons(lessonIds?: string[]) {
  return useQuery({
    queryKey: ['vocabularies', 'by-lessons', lessonIds ?? []],
    queryFn: () => vocabulariesService.findByLessonIds(lessonIds),
  })
}

export function useCreateVocabulary() {
  const t = useTranslations('Vocabularies')
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      lesson_id: string
      word: string
      word_type?: string
      meaning: string
      example?: string
      phonetic?: string
    }) => vocabulariesService.create(payload),
    onSuccess: (vocab, vars) => {
      qc.invalidateQueries({ queryKey: ['vocabularies', vars.lesson_id] })
      qc.invalidateQueries({ queryKey: ['vocabularies'] })
      toast.success(t('createSuccess'))
      fireSynonymSync({ vocab }).then(() => {
        qc.invalidateQueries({ queryKey: ['vocabularies'] })
      })
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
      word_type?: string
      meaning: string
      example?: string
      phonetic?: string
    }) =>
      vocabulariesService.update(vars.id, {
        word: vars.word,
        word_type: vars.word_type,
        meaning: vars.meaning,
        example: vars.example,
        phonetic: vars.phonetic,
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['vocabularies', vars.lessonId] })
      qc.invalidateQueries({ queryKey: ['vocabularies'] })
      toast.success(t('updateSuccess'))
      fireSynonymSync({ vocabId: vars.id }).then(() => {
        qc.invalidateQueries({ queryKey: ['vocabularies'] })
      })
    },
    onError: () => toast.error(t('updateError')),
  })
}

export function useBulkCreateVocabularies() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (items: Parameters<typeof vocabulariesService.bulkCreate>[0]) =>
      vocabulariesService.bulkCreate(items),
    onSuccess: (vocabs) => {
      qc.invalidateQueries({ queryKey: ['vocabularies'] })
      fireSynonymSync({ vocabs }).then(() => {
        qc.invalidateQueries({ queryKey: ['vocabularies'] })
      })
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
