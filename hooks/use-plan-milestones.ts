'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { planMilestonesService } from '~/services/plan-milestones.service'

import type { PlanMilestoneInsert, PlanMilestoneUpdate } from '~/types'

export function useCreateMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PlanMilestoneInsert) =>
      planMilestonesService.create(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['plan', data.plan_id] })
      toast.success('Milestone created')
    },
    onError: () => toast.error('Failed to create milestone'),
  })
}

interface UpdateMilestoneArgs {
  id: string
  planId: string
  payload: PlanMilestoneUpdate
}

export function useUpdateMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: UpdateMilestoneArgs) =>
      planMilestonesService.update(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['plan', vars.planId] })
      toast.success('Milestone updated')
    },
    onError: () => toast.error('Failed to update milestone'),
  })
}

interface DeleteMilestoneArgs {
  id: string
  planId: string
}

export function useDeleteMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: DeleteMilestoneArgs) =>
      planMilestonesService.delete(id),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['plan', vars.planId] })
      toast.success('Milestone deleted')
    },
    onError: () => toast.error('Failed to delete milestone'),
  })
}

interface SetMilestoneProgressArgs {
  id: string
  planId: string
  currentValue: number
}

export function useSetMilestoneProgress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, currentValue }: SetMilestoneProgressArgs) =>
      planMilestonesService.setProgress(id, currentValue),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['plan', vars.planId] })
    },
    onError: () => toast.error('Failed to update progress'),
  })
}
