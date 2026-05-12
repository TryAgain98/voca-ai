'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { MASTERED_THRESHOLD } from '~/lib/mastery-scheduler'
import { supabase } from '~/lib/supabase'
import { vocabulariesService } from '~/services/vocabularies.service'

import type { MasteryStatus, VocabWithMastery, WordMastery } from '~/types'

async function fetchMasteryForUser(userId: string): Promise<WordMastery[]> {
  const { data, error } = await supabase
    .from('word_mastery')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []) as WordMastery[]
}

function deriveMasteryStatus(mastery: WordMastery | null): MasteryStatus {
  if (!mastery) return 'untested'
  if (mastery.level >= MASTERED_THRESHOLD) return 'mastered'
  return 'practicing'
}

export function useVocabulariesWithMastery(userId: string, lessonId?: string) {
  const vocabQuery = useQuery({
    queryKey: ['vocabularies', lessonId],
    queryFn: () =>
      lessonId
        ? vocabulariesService.findByLessonId(lessonId)
        : vocabulariesService.findAll(),
  })

  const masteryQuery = useQuery({
    queryKey: ['word_mastery', 'user', userId],
    queryFn: () => fetchMasteryForUser(userId),
    enabled: !!userId,
  })

  const data = useMemo((): VocabWithMastery[] => {
    const vocabs = vocabQuery.data ?? []
    const masteryRows = masteryQuery.data ?? []
    const masteryMap = new Map(masteryRows.map((m) => [m.word_id, m]))
    return vocabs.map((v) => {
      const mastery = masteryMap.get(v.id) ?? null
      return { ...v, mastery, masteryStatus: deriveMasteryStatus(mastery) }
    })
  }, [vocabQuery.data, masteryQuery.data])

  return {
    data,
    isLoading: vocabQuery.isLoading || masteryQuery.isLoading,
  }
}
