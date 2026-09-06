import { supabase } from '~/lib/supabase'

import { BaseService } from './base.service'

import type {
  PlanMilestone,
  PlanMilestoneInsert,
  PlanMilestoneUpdate,
} from '~/types'

class PlanMilestonesService extends BaseService<
  PlanMilestone,
  PlanMilestoneInsert,
  PlanMilestoneUpdate
> {
  constructor() {
    super('plan_milestones')
  }

  async findByPlan(planId: string): Promise<PlanMilestone[]> {
    const { data, error } = await supabase
      .from('plan_milestones')
      .select('*')
      .eq('plan_id', planId)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return data as PlanMilestone[]
  }

  async setProgress(id: string, currentValue: number): Promise<void> {
    const { error } = await supabase
      .from('plan_milestones')
      .update({ current_value: Math.max(0, currentValue) })
      .eq('id', id)
    if (error) throw error
  }
}

export const planMilestonesService = new PlanMilestonesService()
