import { supabase } from '~/lib/supabase'

import { BaseService } from './base.service'

import type { PassageSession, PassageSessionInsert } from '~/types'

class PassageSessionsService extends BaseService<
  PassageSession,
  PassageSessionInsert
> {
  constructor() {
    super('passage_sessions')
  }

  async findByPassage(passageId: string): Promise<PassageSession[]> {
    const { data, error } = await supabase
      .from('passage_sessions')
      .select('*')
      .eq('passage_id', passageId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as PassageSession[]
  }

  async findLatestExamByUser(userId: string): Promise<PassageSession[]> {
    const { data, error } = await supabase
      .from('passage_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('mode', 'exam')
      .order('created_at', { ascending: false })
    if (error) throw error
    const seen = new Set<string>()
    return (data as PassageSession[]).filter((s) => {
      if (seen.has(s.passage_id)) return false
      seen.add(s.passage_id)
      return true
    })
  }
}

export const passageSessionsService = new PassageSessionsService()
