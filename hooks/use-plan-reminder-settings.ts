'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { planRemindersService } from '~/services/plan-reminders.service'

import type { PlanReminderSettings } from '~/types'

function reminderSettingsKey(userId: string) {
  return ['plan-reminder-settings', userId]
}

export function usePlanReminderSettings(userId: string) {
  return useQuery({
    queryKey: reminderSettingsKey(userId),
    queryFn: () => planRemindersService.getSettings(userId),
    enabled: !!userId,
  })
}

export function useUpsertPlanReminderSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (
      payload: Partial<PlanReminderSettings> & { user_id: string },
    ) => planRemindersService.upsertSettings(payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: reminderSettingsKey(vars.user_id) })
      toast.success('Reminder settings saved')
    },
    onError: () => toast.error('Failed to save reminder settings'),
  })
}
