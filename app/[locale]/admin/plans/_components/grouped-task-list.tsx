'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '~/components/ui/badge'

import { ORIGIN_GROUP_ORDER, groupTasksByOrigin } from '../_utils/group-tasks'

import { TaskRow } from './task-row'

import type { DailyTask, DailyTaskOriginKind } from '~/types'

const GROUP_LABEL_KEY: Record<DailyTaskOriginKind, string> = {
  special_date: 'groupSpecialDate',
  weekday: 'groupWeekday',
  weekend: 'groupWeekend',
  custom: 'groupCustom',
}

interface GroupedTaskListProps {
  tasks: DailyTask[]
  userId: string
  date: string
  planTitleById: Record<string, string>
  nowMinutes: number
  isToday: boolean
  onEdit: (task: DailyTask) => void
  onDelete: (task: DailyTask) => void
}

export function GroupedTaskList({
  tasks,
  userId,
  date,
  planTitleById,
  nowMinutes,
  isToday,
  onEdit,
  onDelete,
}: GroupedTaskListProps) {
  const t = useTranslations('Daily')
  const groups = groupTasksByOrigin(tasks)

  return (
    <div className="flex flex-col gap-5">
      {ORIGIN_GROUP_ORDER.filter((kind) => groups[kind].length > 0).map(
        (kind) => (
          <div key={kind} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{t(GROUP_LABEL_KEY[kind])}</Badge>
              <span className="text-muted-foreground text-xs">
                {groups[kind].length}
              </span>
            </div>
            {groups[kind].map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                userId={userId}
                date={date}
                planTitle={
                  task.plan_id ? (planTitleById[task.plan_id] ?? null) : null
                }
                nowMinutes={nowMinutes}
                isToday={isToday}
                onEdit={() => onEdit(task)}
                onDelete={() => onDelete(task)}
              />
            ))}
          </div>
        ),
      )}
    </div>
  )
}
