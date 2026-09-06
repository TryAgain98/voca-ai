'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { dailyTasksService } from '~/services/daily-tasks.service'

import type { QueryClient } from '@tanstack/react-query'
import type { DailyTask, DailyTaskInsert, DailyTaskUpdate } from '~/types'

export function dailyTasksKey(userId: string, date: string) {
  return ['daily-tasks', userId, date]
}

export function useDailyTasks(userId: string, date: string) {
  return useQuery({
    queryKey: dailyTasksKey(userId, date),
    queryFn: () => dailyTasksService.findByDate(userId, date),
    enabled: !!userId && !!date,
  })
}

export function useCreateDailyTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: DailyTaskInsert) => dailyTasksService.create(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({
        queryKey: dailyTasksKey(data.user_id, data.task_date),
      })
      toast.success('Block created')
    },
    onError: () => toast.error('Failed to create block'),
  })
}

interface UpdateDailyTaskArgs {
  id: string
  userId: string
  date: string
  payload: DailyTaskUpdate
}

export function useUpdateDailyTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, userId, payload }: UpdateDailyTaskArgs) =>
      dailyTasksService.updateByUser(id, userId, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: dailyTasksKey(vars.userId, vars.date) })
      toast.success('Block updated')
    },
    onError: () => toast.error('Failed to update block'),
  })
}

interface DeleteDailyTaskArgs {
  id: string
  userId: string
  date: string
}

export function useDeleteDailyTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, userId }: DeleteDailyTaskArgs) =>
      dailyTasksService.deleteByUser(id, userId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: dailyTasksKey(vars.userId, vars.date) })
      toast.success('Block deleted')
    },
    onError: () => toast.error('Failed to delete block'),
  })
}

interface TaskStatusArgs {
  id: string
  userId: string
  date: string
}

async function patchStatus(
  qc: QueryClient,
  vars: TaskStatusArgs,
  status: DailyTask['status'],
) {
  const key = dailyTasksKey(vars.userId, vars.date)
  await qc.cancelQueries({ queryKey: key })
  const previous = qc.getQueryData<DailyTask[]>(key)
  qc.setQueryData<DailyTask[]>(key, (tasks) =>
    tasks?.map((task) => (task.id === vars.id ? { ...task, status } : task)),
  )
  return { previous, key }
}

export function useStartTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, userId }: TaskStatusArgs) =>
      dailyTasksService.markStarted(id, userId),
    onMutate: (vars) => patchStatus(qc, vars, 'in_progress'),
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(context.key, context.previous)
      toast.error('Failed to start block')
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: dailyTasksKey(vars.userId, vars.date) })
    },
  })
}

export function useCompleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, userId }: TaskStatusArgs) =>
      dailyTasksService.markCompleted(id, userId),
    onMutate: (vars) => patchStatus(qc, vars, 'done'),
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(context.key, context.previous)
      toast.error('Failed to complete block')
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: dailyTasksKey(vars.userId, vars.date) })
    },
  })
}

export function useReopenTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, userId }: TaskStatusArgs) =>
      dailyTasksService.reopen(id, userId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: dailyTasksKey(vars.userId, vars.date) })
    },
    onError: () => toast.error('Failed to reopen block'),
  })
}

interface CopyTasksFromDateArgs {
  userId: string
  sourceDate: string
  targetDate: string
}

export function useCopyTasksFromDate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, sourceDate, targetDate }: CopyTasksFromDateArgs) =>
      dailyTasksService.copyFromDate(userId, sourceDate, targetDate),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: dailyTasksKey(vars.userId, vars.targetDate),
      })
      toast.success('Copied yesterday’s blocks')
    },
    onError: () => toast.error('Failed to copy blocks'),
  })
}
