import { supabase } from '~/lib/supabase'

import { BaseService } from './base.service'

import type { Vocabulary } from '~/types'

type VocabularyInsert = {
  lesson_id: string
  word: string
  meaning: string
  example?: string
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
}

export const vocabulariesService = new VocabulariesService()
