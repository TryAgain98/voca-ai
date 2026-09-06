import { timeToMinutes } from '~/lib/local-time'

import type { DailyTask, DailyTaskStatus } from '~/types'

export function isOverdue(task: DailyTask, nowMinutes: number): boolean {
  if (task.status === 'done' || task.status === 'missed') return false
  return nowMinutes >= timeToMinutes(task.end_time)
}

export function statusVariant(
  status: DailyTaskStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
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
