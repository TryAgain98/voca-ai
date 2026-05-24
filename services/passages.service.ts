import { supabase } from '~/lib/supabase'

import { BaseService } from './base.service'

import type { Passage, PassageInsert } from '~/types'

type PassageUpdate = Partial<PassageInsert>

class PassagesService extends BaseService<
  Passage,
  PassageInsert,
  PassageUpdate
> {
  constructor() {
    super('passages')
  }

  async findAll(): Promise<Passage[]> {
    const { data, error } = await supabase
      .from('passages')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Passage[]
  }
}

export const passagesService = new PassagesService()
