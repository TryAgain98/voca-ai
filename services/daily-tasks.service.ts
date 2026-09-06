import { dayjs } from '~/lib/dayjs'
import { supabase } from '~/lib/supabase'

import { BaseService } from './base.service'

import type { DailyTask, DailyTaskInsert, DailyTaskUpdate } from '~/types'

const OPEN_STATUSES = ['pending', 'in_progress']

class DailyTasksService extends BaseService<
  DailyTask,
  DailyTaskInsert,
  DailyTaskUpdate
> {
  constructor() {
    super('daily_tasks')
  }

  async findByDate(userId: string, date: string): Promise<DailyTask[]> {
    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('task_date', date)
      .order('start_time', { ascending: true })
    if (error) throw error
    return data as DailyTask[]
  }

  async findDueForReminder(dates: string[]): Promise<DailyTask[]> {
    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .in('task_date', dates)
      .in('status', OPEN_STATUSES)
    if (error) throw error
    return data as DailyTask[]
  }

  async findOverdueBefore(date: string): Promise<DailyTask[]> {
    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .lt('task_date', date)
      .in('status', OPEN_STATUSES)
    if (error) throw error
    return data as DailyTask[]
  }

  async updateByUser(
    id: string,
    userId: string,
    payload: DailyTaskUpdate,
  ): Promise<void> {
    const { error } = await supabase
      .from('daily_tasks')
      .update(payload as never)
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
  }

  async deleteByUser(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('daily_tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
  }

  async markStarted(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('daily_tasks')
      .update({ status: 'in_progress', started_at: dayjs().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
  }

  async markCompleted(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('daily_tasks')
      .update({ status: 'done', completed_at: dayjs().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
  }

  async markMissed(ids: string[]): Promise<void> {
    if (ids.length === 0) return
    const { error } = await supabase
      .from('daily_tasks')
      .update({ status: 'missed' })
      .in('id', ids)
    if (error) throw error
  }

  async reopen(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('daily_tasks')
      .update({ status: 'pending', started_at: null, completed_at: null })
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
  }

  async copyFromDate(
    userId: string,
    sourceDate: string,
    targetDate: string,
  ): Promise<DailyTask[]> {
    const sourceTasks = await this.findByDate(userId, sourceDate)
    if (sourceTasks.length === 0) return []

    const payload: DailyTaskInsert[] = sourceTasks.map((task) => ({
      user_id: task.user_id,
      plan_id: task.plan_id,
      milestone_id: task.milestone_id,
      task_date: targetDate,
      start_time: task.start_time,
      end_time: task.end_time,
      title: task.title,
      note: task.note,
      status: 'pending',
    }))

    const { data, error } = await supabase
      .from('daily_tasks')
      .insert(payload)
      .select()
    if (error) throw error
    return data as DailyTask[]
  }
}

export const dailyTasksService = new DailyTasksService()
