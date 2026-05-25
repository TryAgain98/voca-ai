import { supabase } from '~/lib/supabase'

import { BaseService } from './base.service'

import type { Lesson } from '~/types'

type LessonInsert = { name: string; description?: string }
type LessonUpdate = Partial<LessonInsert>

class LessonsService extends BaseService<Lesson, LessonInsert, LessonUpdate> {
  constructor() {
    super('lessons')
  }

  async findAll(): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Lesson[]
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
