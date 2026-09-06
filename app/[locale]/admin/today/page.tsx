'use client'

import { useUser } from '@clerk/nextjs'
import { CopyIcon, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  useCopyTasksFromDate,
  useDailyTasks,
  useDeleteDailyTask,
} from '~/hooks/use-daily-tasks'
import { usePlans } from '~/hooks/use-plans'
import { APP_TIMEZONE, dayjs } from '~/lib/dayjs'
import { localPartsInTz } from '~/lib/local-time'

import { TaskDeleteDialog } from './_components/task-delete-dialog'
import { TaskFormDialog } from './_components/task-form-dialog'
import { TaskRow } from './_components/task-row'

import type { DailyTask } from '~/types'

function today(): string {
  return (
    localPartsInTz(APP_TIMEZONE, new Date())?.date ??
    dayjs().format('YYYY-MM-DD')
  )
}

export default function TodayPage() {
  const t = useTranslations('Today')
  const { user } = useUser()
  const userId = user?.id ?? ''

  const [date, setDate] = useState(today)
  const { data: tasks = [], isLoading } = useDailyTasks(userId, date)
  const { data: plans = [] } = usePlans(userId)
  const deleteTask = useDeleteDailyTask()
  const copyFromDate = useCopyTasksFromDate()

  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null)
  const [deletingTask, setDeletingTask] = useState<DailyTask | null>(null)

  const planTitleById = Object.fromEntries(plans.map((p) => [p.id, p.title]))
  const nowMinutes = localPartsInTz(APP_TIMEZONE, new Date())?.minutesOfDay ?? 0

  function openCreateForm(): void {
    setEditingTask(null)
    setFormOpen(true)
  }

  function openEditForm(task: DailyTask): void {
    setEditingTask(task)
    setFormOpen(true)
  }

  async function handleDeleteConfirm(): Promise<void> {
    if (!deletingTask) return
    try {
      await deleteTask.mutateAsync({ id: deletingTask.id, userId, date })
      setDeletingTask(null)
    } catch {
      // The mutation hook shows the error toast.
    }
  }

  function handleCopyYesterday(): void {
    const sourceDate = dayjs(date).subtract(1, 'day').format('YYYY-MM-DD')
    copyFromDate.mutate({ userId, sourceDate, targetDate: date })
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl leading-7 font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm leading-5">
            {t('description')}
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-auto"
          />
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={handleCopyYesterday}
            disabled={copyFromDate.isPending}
          >
            <CopyIcon size={14} />
            {t('copyYesterday')}
          </Button>
          <Button className="gap-1.5" onClick={openCreateForm}>
            <Plus size={16} />
            {t('addBlock')}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-muted h-16 animate-pulse rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && tasks.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="text-foreground">{t('empty')}</p>
          <p className="text-muted-foreground text-sm">{t('emptyHint')}</p>
          <Button
            variant="outline"
            className="mt-2 gap-2"
            onClick={openCreateForm}
          >
            <Plus size={16} />
            {t('addBlock')}
          </Button>
        </div>
      )}

      {!isLoading && tasks.length > 0 && (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              userId={userId}
              date={date}
              planTitle={
                task.plan_id ? (planTitleById[task.plan_id] ?? null) : null
              }
              nowMinutes={nowMinutes}
              onEdit={() => openEditForm(task)}
              onDelete={() => setDeletingTask(task)}
            />
          ))}
        </div>
      )}

      <TaskFormDialog
        open={formOpen}
        task={editingTask}
        userId={userId}
        date={date}
        onOpenChange={setFormOpen}
      />
      <TaskDeleteDialog
        task={deletingTask}
        isPending={deleteTask.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTask(null)}
      />
    </div>
  )
}
