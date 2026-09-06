import type { DailyTask, DailyTaskOriginKind } from '~/types'

export const ORIGIN_GROUP_ORDER: DailyTaskOriginKind[] = [
  'special_date',
  'weekday',
  'weekend',
  'custom',
]

export function groupTasksByOrigin(
  tasks: DailyTask[],
): Record<DailyTaskOriginKind, DailyTask[]> {
  const groups: Record<DailyTaskOriginKind, DailyTask[]> = {
    special_date: [],
    weekday: [],
    weekend: [],
    custom: [],
  }
  for (const task of tasks) {
    groups[task.origin_kind].push(task)
  }
  return groups
}
