'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { dailyTaskGenerationService } from '~/services/daily-task-generation.service'

import { dailyTasksKey } from './use-daily-tasks'

export function useEnsureDailyTasksGenerated(userId: string, date: string) {
  const qc = useQueryClient()
  return useQuery({
    queryKey: ['daily-task-generation', userId, date],
    queryFn: async () => {
      const result = await dailyTaskGenerationService.ensureGeneratedForDate(
        userId,
        date,
      )
      if (result.insertedCount > 0) {
        qc.invalidateQueries({ queryKey: dailyTasksKey(userId, date) })
      }
      return result
    },
    enabled: !!userId && !!date,
    staleTime: Infinity,
  })
}
