import { supabase } from '~/lib/supabase'

import { BaseService } from './base.service'

import type { Lesson } from '~/types'

type LessonInsert = { name: string; description?: string }
type LessonUpdate = Partial<LessonInsert>

class LessonsService extends BaseService<Lesson, LessonInsert, LessonUpdate> {
  constructor() {
    super('lessons')
  }

  async createAndReturn(payload: LessonInsert): Promise<Lesson> {
    const { data, error } = await supabase
      .from('lessons')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data as Lesson
  }
}

export const lessonsService = new LessonsService()
