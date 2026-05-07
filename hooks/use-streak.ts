'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

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
    onError: () => toast.error('Failed to save preferences'),
  })
}
