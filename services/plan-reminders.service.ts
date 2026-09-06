import { supabase } from '~/lib/supabase'

import type { PlanReminderSettings, TaskNotificationKind } from '~/types'

const UNIQUE_VIOLATION_CODE = '23505'

class PlanRemindersService {
  async getSettings(userId: string): Promise<PlanReminderSettings | null> {
    const { data, error } = await supabase
      .from('plan_reminder_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    return data as PlanReminderSettings | null
  }

  async upsertSettings(
    payload: Partial<PlanReminderSettings> & { user_id: string },
  ): Promise<void> {
    const { error } = await supabase
      .from('plan_reminder_settings')
      .upsert(payload, { onConflict: 'user_id' })
    if (error) throw error
  }

  async findEnabledSettings(): Promise<PlanReminderSettings[]> {
    const { data, error } = await supabase
      .from('plan_reminder_settings')
      .select('*')
      .eq('is_enabled', true)
      .not('email', 'is', null)
    if (error) throw error
    return data as PlanReminderSettings[]
  }

  async hasSent(taskId: string, kind: TaskNotificationKind): Promise<boolean> {
    const { data, error } = await supabase
      .from('task_notifications')
      .select('id')
      .eq('task_id', taskId)
      .eq('kind', kind)
      .maybeSingle()
    if (error) throw error
    return data !== null
  }

  async markSent(taskId: string, kind: TaskNotificationKind): Promise<boolean> {
    const { error } = await supabase
      .from('task_notifications')
      .insert({ task_id: taskId, kind })
    if (error) {
      if (error.code === UNIQUE_VIOLATION_CODE) return false
      throw error
    }
    return true
  }
}

export const planRemindersService = new PlanRemindersService()
