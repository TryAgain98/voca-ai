'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { logAppError } from '~/services/app-error-log.service'
import { streakService } from '~/services/streak.service'

import type { StreakReminderPrefs } from '~/types'

const QUERY_KEY = 'user-streak'

export function useStreak(userId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, userId],
    queryFn: () => streakService.findByUserId(userId),
    enabled: !!userId,
  })
}

export function useRecordStreakActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => streakService.recordActivity(userId),
    onSuccess: (data) => {
      qc.setQueryData([QUERY_KEY, data.user_id], data)
    },
    onError: (error, userId) => {
      console.error('[streak] failed to record activity', { error, userId })
      logAppError({
        source: 'streak',
        action: 'record-activity',
        error,
        userId,
      })
      toast.error('Failed to record streak')
    },
  })
}

interface UpdateReminderArgs {
  userId: string
  prefs: StreakReminderPrefs
}

export function useUpdateStreakReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, prefs }: UpdateReminderArgs) =>
      streakService.upsertReminderPrefs(userId, prefs),
    onSuccess: (data) => {
      qc.setQueryData([QUERY_KEY, data.user_id], data)
      toast.success('Reminder preferences saved')
    },
    onError: (error, vars) => {
      console.error('[streak] failed to save reminder preferences', {
        error,
        userId: vars.userId,
      })
      logAppError({
        source: 'streak',
        action: 'save-reminder-preferences',
        error,
        userId: vars.userId,
        details: {
          prefs: vars.prefs,
        },
      })
      toast.error('Failed to save preferences')
    },
  })
}
