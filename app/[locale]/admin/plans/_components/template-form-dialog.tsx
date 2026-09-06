'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  useCreateTaskTemplate,
  useUpdateTaskTemplate,
} from '~/hooks/use-task-templates'

import { useSpecialDateField } from '../_hooks/use-special-date-field'
import {
  emptyTemplateValues,
  templateSchema,
  templateValuesFromTemplate,
} from '../_utils/template-form-values'

import {
  NO_PLAN_VALUE,
  TaskPlanMilestoneSelect,
} from './task-plan-milestone-select'
import { TemplateBasicFields } from './template-basic-fields'

import type { TemplateFormValues } from '../_utils/template-form-values'
import type { RecurrenceKind, TaskTemplate } from '~/types'

interface TemplateFormProps {
  template: TaskTemplate | null
  userId: string
  recurrenceKind: RecurrenceKind
  onSaved: () => void
  onCancel: () => void
}

function TemplateForm({
  template,
  userId,
  recurrenceKind,
  onSaved,
  onCancel,
}: TemplateFormProps) {
  const t = useTranslations('TaskTemplates')
  const createTemplate = useCreateTaskTemplate()
  const updateTemplate = useUpdateTaskTemplate()

  const [values, setValues] = useState<TemplateFormValues>(() =>
    template ? templateValuesFromTemplate(template) : emptyTemplateValues(),
  )
  const [planId, setPlanId] = useState(template?.plan_id ?? NO_PLAN_VALUE)
  const [milestoneId, setMilestoneId] = useState(
    template?.milestone_id ?? NO_PLAN_VALUE,
  )
  const [hasInvalidRange, setHasInvalidRange] = useState(false)
  const specialDate = useSpecialDateField(template)

  const isPending = createTemplate.isPending || updateTemplate.isPending

  function updateField<K extends keyof TemplateFormValues>(
    key: K,
    value: TemplateFormValues[K],
  ): void {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handlePlanChange(nextPlanId: string): void {
    setPlanId(nextPlanId)
    setMilestoneId(NO_PLAN_VALUE)
  }

  async function handleSubmit(): Promise<void> {
    const result = templateSchema.safeParse(values)
    if (!result.success) {
      setHasInvalidRange(
        result.error.issues.some((issue) => issue.path[0] === 'end_time'),
      )
      return
    }
    setHasInvalidRange(false)

    const isSpecialDate = recurrenceKind === 'special_date'
    if (!specialDate.validate(isSpecialDate)) return

    const payload = {
      title: result.data.title,
      note: result.data.note || null,
      start_time: result.data.start_time,
      end_time: result.data.end_time,
      plan_id: planId === NO_PLAN_VALUE ? null : planId,
      milestone_id: milestoneId === NO_PLAN_VALUE ? null : milestoneId,
      ...specialDate.toPayload(isSpecialDate),
      needs_check: result.data.needs_check,
    }

    try {
      if (template) {
        await updateTemplate.mutateAsync({
          id: template.id,
          userId,
          payload,
        })
      } else {
        await createTemplate.mutateAsync({
          ...payload,
          user_id: userId,
          recurrence_kind: recurrenceKind,
          sort_order: 0,
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
        <DialogTitle>{t('newTemplate')}</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <TemplateBasicFields
          values={values}
          hasInvalidRange={hasInvalidRange}
          specialDateConfig={
            recurrenceKind === 'special_date'
              ? {
                  values: specialDate.values,
                  hasError: specialDate.hasError,
                  onModeChange: specialDate.onModeChange,
                  onDatesChange: specialDate.onDatesChange,
                  onRangeChange: specialDate.onRangeChange,
                }
              : null
          }
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

interface TemplateFormDialogProps {
  open: boolean
  template: TaskTemplate | null
  userId: string
  recurrenceKind: RecurrenceKind
  onOpenChange: (open: boolean) => void
}

export function TemplateFormDialog({
  open,
  template,
  userId,
  recurrenceKind,
  onOpenChange,
}: TemplateFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <TemplateForm
            key={template?.id ?? 'new'}
            template={template}
            userId={userId}
            recurrenceKind={recurrenceKind}
            onSaved={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
