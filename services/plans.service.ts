import { supabase } from '~/lib/supabase'

import { BaseService } from './base.service'

import type { Plan, PlanInsert, PlanUpdate, PlanWithMilestones } from '~/types'

class PlansService extends BaseService<Plan, PlanInsert, PlanUpdate> {
  constructor() {
    super('plans')
  }

  async findByUser(userId: string): Promise<Plan[]> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'archived')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Plan[]
  }

  async findWithMilestones(
    planId: string,
    userId: string,
  ): Promise<PlanWithMilestones> {
    const { data, error } = await supabase
      .from('plans')
      .select('*, milestones:plan_milestones(*)')
      .eq('id', planId)
      .eq('user_id', userId)
      .order('sort_order', {
        ascending: true,
        referencedTable: 'plan_milestones',
      })
      .single()
    if (error) throw error
    return data as unknown as PlanWithMilestones
  }

  async updateByUser(
    id: string,
    userId: string,
    payload: PlanUpdate,
  ): Promise<void> {
    const { error } = await supabase
      .from('plans')
      .update(payload as never)
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
  }

  async deleteByUser(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
  }
}

export const plansService = new PlansService()
