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
import { cn } from '~/lib/cn'

import { isCurrentTask, taskStatusDisplay } from '../_utils/task-status'

import { TaskSaveAsTemplateButton } from './task-save-as-template-button'

import type { DailyTask } from '~/types'

interface TaskRowProps {
  task: DailyTask
  userId: string
  date: string
  planTitle: string | null
  nowMinutes: number
  isToday: boolean
  onEdit: () => void
  onDelete: () => void
}

export function TaskRow({
  task,
  userId,
  date,
  planTitle,
  nowMinutes,
  isToday,
  onEdit,
  onDelete,
}: TaskRowProps) {
  const t = useTranslations('Daily')
  const startTask = useStartTask()
  const completeTask = useCompleteTask()
  const reopenTask = useReopenTask()

  const args = { id: task.id, userId, date }
  const status = taskStatusDisplay(task, nowMinutes)
  const isCurrent = isToday && isCurrentTask(task, nowMinutes)

  return (
    <div
      className={cn(
        'border-border bg-card flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:gap-3',
        isCurrent &&
          'border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/20',
      )}
    >
      <div className="text-muted-foreground w-28 shrink-0 text-xs tabular-nums">
        {task.start_time.slice(0, 5)} – {task.end_time.slice(0, 5)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {isCurrent && (
            <span className="flex items-center gap-1 text-xs font-[510] text-indigo-500">
              <span className="size-1.5 rounded-full bg-indigo-500" />
              {t('now')}
            </span>
          )}
          <p className="text-foreground truncate text-sm font-[510]">
            {task.title}
          </p>
          {task.needs_review && (
            <Badge
              variant="outline"
              className="border-amber-500/40 text-amber-600 dark:text-amber-400"
            >
              {t('needsReview')}
            </Badge>
          )}
          {!task.needs_check && (
            <Badge variant="outline" className="text-muted-foreground">
              {t('autoTag')}
            </Badge>
          )}
        </div>
        {planTitle && (
          <Badge variant="outline" className="mt-1">
            {planTitle}
          </Badge>
        )}
      </div>

      {task.needs_check && (
        <Badge variant={status.variant} className="shrink-0">
          {t(status.labelKey)}
        </Badge>
      )}

      <div className="flex shrink-0 items-center gap-1.5">
        <TaskSaveAsTemplateButton task={task} />
        {task.needs_check && task.status === 'pending' && (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => startTask.mutate(args)}
          >
            <Play size={14} />
            {t('start')}
          </Button>
        )}
        {task.needs_check && task.status === 'in_progress' && (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => completeTask.mutate(args)}
          >
            <Check size={14} />
            {t('complete')}
          </Button>
        )}
        {task.needs_check && task.status === 'done' && (
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
        {task.needs_check && task.status === 'missed' && (
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
