import { supabase } from '~/lib/supabase'

import { BaseService } from './base.service'

import type {
  RecurrenceKind,
  TaskTemplate,
  TaskTemplateInsert,
  TaskTemplateUpdate,
} from '~/types'

class TaskTemplatesService extends BaseService<
  TaskTemplate,
  TaskTemplateInsert,
  TaskTemplateUpdate
> {
  constructor() {
    super('task_templates')
  }

  async findByUser(userId: string): Promise<TaskTemplate[]> {
    const { data, error } = await supabase
      .from('task_templates')
      .select('*')
      .eq('user_id', userId)
      .order('recurrence_kind', { ascending: true })
      .order('sort_order', { ascending: true })
    if (error) throw error
    return data as TaskTemplate[]
  }

  async findByKind(
    userId: string,
    kind: RecurrenceKind,
  ): Promise<TaskTemplate[]> {
    const { data, error } = await supabase
      .from('task_templates')
      .select('*')
      .eq('user_id', userId)
      .eq('recurrence_kind', kind)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return data as TaskTemplate[]
  }

  async findSpecialDate(userId: string, date: string): Promise<TaskTemplate[]> {
    const { data, error } = await supabase
      .from('task_templates')
      .select('*')
      .eq('user_id', userId)
      .eq('recurrence_kind', 'special_date')
      .or(
        `special_dates.cs.{${date}},and(special_date_start.lte.${date},special_date_end.gte.${date})`,
      )
      .order('sort_order', { ascending: true })
    if (error) throw error
    return data as TaskTemplate[]
  }

  async updateByUser(
    id: string,
    userId: string,
    payload: TaskTemplateUpdate,
  ): Promise<void> {
    const { error } = await supabase
      .from('task_templates')
      .update(payload as never)
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
  }

  async deleteByUser(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('task_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
  }

  async createMany(payload: TaskTemplateInsert[]): Promise<TaskTemplate[]> {
    if (payload.length === 0) return []
    const { data, error } = await supabase
      .from('task_templates')
      .insert(payload)
      .select()
    if (error) throw error
    return data as TaskTemplate[]
  }
}

export const taskTemplatesService = new TaskTemplatesService()
