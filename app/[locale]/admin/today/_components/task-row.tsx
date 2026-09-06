'use client'

import { Check, Pencil, Play, RotateCcw, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  useCompleteTask,
  useReopenTask,
  useStartTask,
} from '~/hooks/use-daily-tasks'

import {
  STATUS_LABEL_KEY,
  isOverdue,
  statusVariant,
} from '../_utils/task-status'

import type { DailyTask } from '~/types'

interface TaskRowProps {
  task: DailyTask
  userId: string
  date: string
  planTitle: string | null
  nowMinutes: number
  onEdit: () => void
  onDelete: () => void
}

export function TaskRow({
  task,
  userId,
  date,
  planTitle,
  nowMinutes,
  onEdit,
  onDelete,
}: TaskRowProps) {
  const t = useTranslations('Today')
  const startTask = useStartTask()
  const completeTask = useCompleteTask()
  const reopenTask = useReopenTask()

  const args = { id: task.id, userId, date }
  const overdue = isOverdue(task, nowMinutes)

  return (
    <div className="border-border bg-card flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:gap-3">
      <div className="text-muted-foreground w-28 shrink-0 text-xs tabular-nums">
        {task.start_time.slice(0, 5)} – {task.end_time.slice(0, 5)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-[510]">
          {task.title}
        </p>
        {planTitle && (
          <Badge variant="outline" className="mt-1">
            {planTitle}
          </Badge>
        )}
      </div>

      <Badge
        variant={overdue ? 'destructive' : statusVariant(task.status)}
        className="shrink-0"
      >
        {t(STATUS_LABEL_KEY[task.status])}
      </Badge>

      <div className="flex shrink-0 items-center gap-1.5">
        {task.status === 'pending' && (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => startTask.mutate(args)}
          >
            <Play size={14} />
            {t('start')}
          </Button>
        )}
        {task.status === 'in_progress' && (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => completeTask.mutate(args)}
          >
            <Check size={14} />
            {t('complete')}
          </Button>
        )}
        {task.status === 'done' && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => reopenTask.mutate(args)}
          >
            <RotateCcw size={14} />
            {t('undo')}
          </Button>
        )}
        {task.status === 'missed' && (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => startTask.mutate(args)}
          >
            <Play size={14} />
            {t('start')}
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" onClick={onEdit}>
          <Pencil size={14} />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onDelete}>
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  )
}
