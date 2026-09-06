'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { plansService } from '~/services/plans.service'

import type { PlanInsert, PlanUpdate } from '~/types'

export function usePlans(userId: string) {
  return useQuery({
    queryKey: ['plans', userId],
    queryFn: () => plansService.findByUser(userId),
    enabled: !!userId,
  })
}

export function usePlanWithMilestones(planId: string, userId: string) {
  return useQuery({
    queryKey: ['plan', planId],
    queryFn: () => plansService.findWithMilestones(planId, userId),
    enabled: !!planId && !!userId,
  })
}

export function useCreatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PlanInsert) => plansService.create(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['plans', data.user_id] })
      toast.success('Plan created')
    },
    onError: () => toast.error('Failed to create plan'),
  })
}

interface UpdatePlanArgs {
  id: string
  userId: string
  payload: PlanUpdate
}

export function useUpdatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, userId, payload }: UpdatePlanArgs) =>
      plansService.updateByUser(id, userId, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['plans', vars.userId] })
      qc.invalidateQueries({ queryKey: ['plan', vars.id] })
      toast.success('Plan updated')
    },
    onError: () => toast.error('Failed to update plan'),
  })
}

interface DeletePlanArgs {
  id: string
  userId: string
}

export function useDeletePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, userId }: DeletePlanArgs) =>
      plansService.deleteByUser(id, userId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['plans', vars.userId] })
      toast.success('Plan deleted')
    },
    onError: () => toast.error('Failed to delete plan'),
  })
}
