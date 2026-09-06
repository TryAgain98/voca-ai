'use client'

import { useUser } from '@clerk/nextjs'
import { CopyIcon, Settings2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button, buttonVariants } from '~/components/ui/button'
import { useEnsureDailyTasksGenerated } from '~/hooks/use-daily-task-generation'
import {
  useCopyTasksFromDate,
  useDailyTasks,
  useDeleteDailyTask,
} from '~/hooks/use-daily-tasks'
import { usePlans } from '~/hooks/use-plans'
import { cn } from '~/lib/cn'
import { APP_TIMEZONE, dayjs } from '~/lib/dayjs'
import { localPartsInTz } from '~/lib/local-time'

import { DailyDateNav } from './_components/daily-date-nav'
import { GroupedTaskList } from './_components/grouped-task-list'
import { PlanTabsNav } from './_components/plan-tabs-nav'
import { TaskDeleteDialog } from './_components/task-delete-dialog'
import { TaskFormDialog } from './_components/task-form-dialog'

import type { DailyTask } from '~/types'

function today(): string {
  return (
    localPartsInTz(APP_TIMEZONE, new Date())?.date ??
    dayjs().format('YYYY-MM-DD')
  )
}

export default function DailyPage() {
  const t = useTranslations('Daily')
  const { user } = useUser()
  const userId = user?.id ?? ''
  const params = useParams()
  const locale = params.locale as string

  const [date, setDate] = useState(today)
  const todayDate = today()
  const isToday = date === todayDate
  useEnsureDailyTasksGenerated(userId, date)
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
      <PlanTabsNav active="daily" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl leading-7 font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm leading-5">
            {t('description')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DailyDateNav
            date={date}
            todayDate={todayDate}
            onDateChange={setDate}
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
          <Link
            href={`/${locale}/admin/plans/templates`}
            className={cn(buttonVariants({ variant: 'outline' }), 'gap-1.5')}
          >
            <Settings2 size={14} />
            {t('manageTemplates')}
          </Link>
          <Button className="gap-1.5" onClick={openCreateForm}>
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
            {t('addBlock')}
          </Button>
        </div>
      )}

      {!isLoading && tasks.length > 0 && (
        <GroupedTaskList
          tasks={tasks}
          userId={userId}
          date={date}
          planTitleById={planTitleById}
          nowMinutes={nowMinutes}
          isToday={isToday}
          onEdit={(task) => {
            setEditingTask(task)
            setFormOpen(true)
          }}
          onDelete={setDeletingTask}
        />
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
