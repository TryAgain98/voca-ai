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
}

export const passageSessionsService = new PassageSessionsService()
