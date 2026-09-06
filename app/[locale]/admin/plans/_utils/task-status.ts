import { timeToMinutes } from '~/lib/local-time'

import type { DailyTask, DailyTaskStatus } from '~/types'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

export function isOverdue(task: DailyTask, nowMinutes: number): boolean {
  if (task.status === 'done' || task.status === 'missed') return false
  return nowMinutes >= timeToMinutes(task.end_time)
}

export function isCurrentTask(task: DailyTask, nowMinutes: number): boolean {
  if (task.status === 'done' || task.status === 'missed') return false
  return (
    nowMinutes >= timeToMinutes(task.start_time) &&
    nowMinutes < timeToMinutes(task.end_time)
  )
}

function statusVariant(status: DailyTaskStatus): BadgeVariant {
  switch (status) {
    case 'done':
      return 'default'
    case 'in_progress':
      return 'secondary'
    case 'missed':
      return 'destructive'
    default:
      return 'outline'
  }
}

export const STATUS_LABEL_KEY: Record<DailyTaskStatus, string> = {
  pending: 'statusPending',
  in_progress: 'statusInProgress',
  done: 'statusDone',
  missed: 'statusMissed',
}

export function taskStatusDisplay(
  task: DailyTask,
  nowMinutes: number,
): { labelKey: string; variant: BadgeVariant } {
  if (isOverdue(task, nowMinutes)) {
    return { labelKey: 'statusOverdue', variant: 'destructive' }
  }
  return {
    labelKey: STATUS_LABEL_KEY[task.status],
    variant: statusVariant(task.status),
  }
}
