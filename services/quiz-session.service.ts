import { supabase } from '~/lib/supabase'

import type { QuizIncorrectWord, QuizSession, QuizSessionInsert } from '~/types'

class QuizSessionService {
  async create(payload: QuizSessionInsert): Promise<QuizSession> {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data as QuizSession
  }

  async findByUserId(userId: string): Promise<QuizSession[]> {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as QuizSession[]
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('quiz_sessions').delete().eq('id', id)
    if (error) throw error
  }
}

export const quizSessionService = new QuizSessionService()
export type { QuizIncorrectWord, QuizSession, QuizSessionInsert }
