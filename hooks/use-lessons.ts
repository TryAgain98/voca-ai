'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { supabase } from '~/lib/supabase'

import type { Lesson } from '~/types'

export function useLessons() {
  return useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const { data, error } = await supabase.from('lessons').select('*')
      if (error) throw error
      return data as Lesson[]
    },
  })
}

export function useCreateLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { name: string; description?: string }) => {
      const { error } = await supabase.from('lessons').insert(payload)
      if (error) throw error
    },
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
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string
      name: string
      description?: string
    }) => {
      const { error } = await supabase
        .from('lessons')
        .update(payload)
        .eq('id', id)
      if (error) throw error
    },
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
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('lessons').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lessons'] })
      toast.success('Lesson deleted')
    },
    onError: () => toast.error('Failed to delete lesson'),
  })
}
