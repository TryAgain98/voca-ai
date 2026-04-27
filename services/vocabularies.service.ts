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

  async findByLessonId(lessonId: string): Promise<Vocabulary[]> {
    const { data, error } = await supabase
      .from('vocabularies')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('word')
    if (error) throw error
    return data as Vocabulary[]
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
    const { data, error } = await supabase
      .from('vocabularies')
      .insert(items)
      .select()
    if (error) throw error
    return data as Vocabulary[]
  }

  async updateByWord(
    word: string,
    payload: VocabularyUpdate,
  ): Promise<Vocabulary> {
    const { data, error } = await supabase
      .from('vocabularies')
      .update(payload)
      .eq('word', word)
      .select()
      .single()
    if (error) throw error
    return data as Vocabulary
  }
}

export const vocabulariesService = new VocabulariesService()
