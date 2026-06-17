import { supabase } from '~/lib/supabase'

import { BaseService } from './base.service'

import type { WritingAttempt, WritingAttemptInsert } from '~/types'

class WritingAttemptsService extends BaseService<
  WritingAttempt,
  WritingAttemptInsert
> {
  constructor() {
    super('writing_attempts')
  }

  async findByExercise(exerciseId: string): Promise<WritingAttempt[]> {
    const { data, error } = await supabase
      .from('writing_attempts')
      .select('*')
      .eq('exercise_id', exerciseId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as WritingAttempt[]
  }

  async findLatestByUser(userId: string): Promise<WritingAttempt[]> {
    const { data, error } = await supabase
      .from('writing_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as WritingAttempt[]
  }

  async upsert(attempt: WritingAttemptInsert): Promise<void> {
    const { error } = await supabase
      .from('writing_attempts')
      .upsert(attempt, { onConflict: 'exercise_id,user_id' })
    if (error) throw error
  }
}

export const writingAttemptsService = new WritingAttemptsService()
