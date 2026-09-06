'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { APP_TIMEZONE, dayjs } from '~/lib/dayjs'
import { localPartsInTz } from '~/lib/local-time'
import { dailyTaskGenerationService } from '~/services/daily-task-generation.service'
import { taskTemplatesService } from '~/services/task-templates.service'

import { dailyTasksKey } from './use-daily-tasks'

import type {
  TaskTemplate,
  TaskTemplateInsert,
  TaskTemplateUpdate,
} from '~/types'

export function taskTemplatesKey(userId: string) {
  return ['task-templates', userId]
}

function today(): string {
  return (
    localPartsInTz(APP_TIMEZONE, new Date())?.date ??
    dayjs().format('YYYY-MM-DD')
  )
}

export async function backfillToday(
  qc: ReturnType<typeof useQueryClient>,
  userId: string,
  template: TaskTemplate,
): Promise<void> {
  const todayDate = today()
  if (!dailyTaskGenerationService.templateMatchesDate(template, todayDate)) {
    return
  }
  await dailyTaskGenerationService.backfillTemplateForDate(
    userId,
    template,
    todayDate,
  )
  qc.invalidateQueries({ queryKey: dailyTasksKey(userId, todayDate) })
}

export function useTaskTemplates(userId: string) {
  return useQuery({
    queryKey: taskTemplatesKey(userId),
    queryFn: () => taskTemplatesService.findByUser(userId),
    enabled: !!userId,
  })
}

export function useCreateTaskTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TaskTemplateInsert) =>
      taskTemplatesService.create(payload),
    onSuccess: async (data) => {
      qc.invalidateQueries({ queryKey: taskTemplatesKey(data.user_id) })
      await backfillToday(qc, data.user_id, data)
      toast.success('Template created')
    },
    onError: () => toast.error('Failed to create template'),
  })
}

interface UpdateTaskTemplateArgs {
  id: string
  userId: string
  payload: TaskTemplateUpdate
}

export function useUpdateTaskTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, userId, payload }: UpdateTaskTemplateArgs) =>
      taskTemplatesService.updateByUser(id, userId, payload),
    onSuccess: async (_data, vars) => {
      qc.invalidateQueries({ queryKey: taskTemplatesKey(vars.userId) })
      const updated = await taskTemplatesService.findById(vars.id)
      await backfillToday(qc, vars.userId, updated)
      toast.success('Template updated')
    },
    onError: () => toast.error('Failed to update template'),
  })
}

interface DeleteTaskTemplateArgs {
  id: string
  userId: string
}

export function useDeleteTaskTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, userId }: DeleteTaskTemplateArgs) =>
      taskTemplatesService.deleteByUser(id, userId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: taskTemplatesKey(vars.userId) })
      toast.success('Template deleted')
    },
    onError: () => toast.error('Failed to delete template'),
  })
}
