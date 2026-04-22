import { BaseService } from './base.service'

import type { Lesson } from '~/types'

type LessonInsert = { name: string; description?: string }
type LessonUpdate = Partial<LessonInsert>

class LessonsService extends BaseService<Lesson, LessonInsert, LessonUpdate> {
  constructor() {
    super('lessons')
  }
}

export const lessonsService = new LessonsService()
