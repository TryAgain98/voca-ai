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

  async findWithMilestones(planId: string): Promise<PlanWithMilestones> {
    const { data, error } = await supabase
      .from('plans')
      .select('*, milestones:plan_milestones(*)')
      .eq('id', planId)
      .order('sort_order', {
        ascending: true,
        referencedTable: 'plan_milestones',
      })
      .single()
    if (error) throw error
    return data as unknown as PlanWithMilestones
  }
}

export const plansService = new PlansService()
