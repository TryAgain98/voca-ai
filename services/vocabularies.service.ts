import { supabase } from '~/lib/supabase'

import { BaseService } from './base.service'

import type { Vocabulary } from '~/types'

type VocabularyInsert = {
  lesson_id: string
  word: string
  meaning: string
  example?: string
  word_type?: string
  phonetic?: string
  description?: string
  synonyms?: string[]
}
type VocabularyUpdate = Partial<Omit<VocabularyInsert, 'lesson_id'>>

class VocabulariesService extends BaseService<
  Vocabulary,
  VocabularyInsert,
  VocabularyUpdate
> {
  constructor() {
    super('vocabularies')
  }

  async create(payload: VocabularyInsert): Promise<Vocabulary> {
    const { data, error } = await supabase
      .from('vocabularies')
      .insert({ ...payload, synonyms: payload.synonyms ?? [] })
      .select()
      .single()
    if (error) throw error
    return data as Vocabulary
  }

  async update(id: string, payload: VocabularyUpdate): Promise<void> {
    return super.update(id, payload)
  }

  async findByLessonId(lessonId: string): Promise<Vocabulary[]> {
    const { data, error } = await supabase
      .from('vocabularies')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('word')
    if (error) throw error
    return data as Vocabulary[]
  }

  async findByLessonIds(lessonIds?: string[]): Promise<Vocabulary[]> {
    let query = supabase.from('vocabularies').select('*').order('word')
    if (lessonIds && lessonIds.length > 0) {
      query = query.in('lesson_id', lessonIds)
    }
    const { data, error } = await query
    if (error) throw error
    return data as Vocabulary[]
  }

  async findByWord(word: string): Promise<Vocabulary | null> {
    const { data, error } = await supabase
      .from('vocabularies')
      .select('*')
      .ilike('word', word)
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data as Vocabulary | null
  }

  async findByWords(words: string[]): Promise<Vocabulary[]> {
    const { data, error } = await supabase
      .from('vocabularies')
      .select('*')
      .in('word', words)
    if (error) throw error
    return data as Vocabulary[]
  }

  async bulkCreate(items: VocabularyInsert[]): Promise<Vocabulary[]> {
    const withSynonyms = items.map((item) => ({
      ...item,
      synonyms: item.synonyms ?? [],
    }))
    const { data, error } = await supabase
      .from('vocabularies')
      .insert(withSynonyms)
      .select()
    if (error) throw error
    return data as Vocabulary[]
  }
}

export const vocabulariesService = new VocabulariesService()
