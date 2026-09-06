'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { z } from 'zod'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { useCreateDailyTask, useUpdateDailyTask } from '~/hooks/use-daily-tasks'

import { TaskBasicFields } from './task-basic-fields'
import {
  NO_PLAN_VALUE,
  TaskPlanMilestoneSelect,
} from './task-plan-milestone-select'

import type { DailyTask } from '~/types'

const taskSchema = z
  .object({
    title: z.string().trim().min(1),
    note: z.string().trim(),
    start_time: z.string().min(1),
    end_time: z.string().min(1),
    needs_check: z.boolean(),
  })
  .refine((v) => v.end_time > v.start_time, { path: ['end_time'] })

type TaskFormValues = z.infer<typeof taskSchema>

function emptyValues(): TaskFormValues {
  return {
    title: '',
    note: '',
    start_time: '',
    end_time: '',
    needs_check: true,
  }
}

function valuesFromTask(task: DailyTask): TaskFormValues {
  return {
    title: task.title,
    note: task.note ?? '',
    start_time: task.start_time.slice(0, 5),
    end_time: task.end_time.slice(0, 5),
    needs_check: task.needs_check,
  }
}

interface TaskFormProps {
  task: DailyTask | null
  userId: string
  date: string
  onSaved: () => void
  onCancel: () => void
}

function TaskForm({ task, userId, date, onSaved, onCancel }: TaskFormProps) {
  const t = useTranslations('Daily')
  const createTask = useCreateDailyTask()
  const updateTask = useUpdateDailyTask()

  const [values, setValues] = useState<TaskFormValues>(() =>
    task ? valuesFromTask(task) : emptyValues(),
  )
  const [planId, setPlanId] = useState(task?.plan_id ?? NO_PLAN_VALUE)
  const [milestoneId, setMilestoneId] = useState(
    task?.milestone_id ?? NO_PLAN_VALUE,
  )
  const [hasInvalidRange, setHasInvalidRange] = useState(false)

  const isPending = createTask.isPending || updateTask.isPending

  function updateField<K extends keyof TaskFormValues>(
    key: K,
    value: TaskFormValues[K],
  ): void {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handlePlanChange(nextPlanId: string): void {
    setPlanId(nextPlanId)
    setMilestoneId(NO_PLAN_VALUE)
  }

  async function handleSubmit(): Promise<void> {
    const result = taskSchema.safeParse(values)
    if (!result.success) {
      setHasInvalidRange(
        result.error.issues.some((issue) => issue.path[0] === 'end_time'),
      )
      return
    }
    setHasInvalidRange(false)

    const payload = {
      title: result.data.title,
      note: result.data.note || null,
      start_time: result.data.start_time,
      end_time: result.data.end_time,
      plan_id: planId === NO_PLAN_VALUE ? null : planId,
      milestone_id: milestoneId === NO_PLAN_VALUE ? null : milestoneId,
      needs_check: result.data.needs_check,
    }

    try {
      if (task) {
        await updateTask.mutateAsync({ id: task.id, userId, date, payload })
      } else {
        await createTask.mutateAsync({
          ...payload,
          user_id: userId,
          task_date: date,
          origin_template_id: null,
          origin_kind: 'custom',
          needs_review: false,
        })
      }
      onSaved()
    } catch {
      // The mutation hook shows the error toast.
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('addBlock')}</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <TaskBasicFields
          values={values}
          hasInvalidRange={hasInvalidRange}
          onChange={updateField}
        />

        <TaskPlanMilestoneSelect
          userId={userId}
          planId={planId}
          milestoneId={milestoneId}
          onPlanChange={handlePlanChange}
          onMilestoneChange={setMilestoneId}
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          {t('cancel')}
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {t('save')}
        </Button>
      </DialogFooter>
    </>
  )
}

interface TaskFormDialogProps {
  open: boolean
  task: DailyTask | null
  userId: string
  date: string
  onOpenChange: (open: boolean) => void
}

export function TaskFormDialog({
  open,
  task,
  userId,
  date,
  onOpenChange,
}: TaskFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <TaskForm
            key={task?.id ?? 'new'}
            task={task}
            userId={userId}
            date={date}
            onSaved={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
