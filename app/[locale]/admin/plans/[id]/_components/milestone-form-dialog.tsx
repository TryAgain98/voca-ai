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
import { Input } from '~/components/ui/input'
import {
  useCreateMilestone,
  useUpdateMilestone,
} from '~/hooks/use-plan-milestones'

import type { PlanMilestone } from '~/types'

const milestoneSchema = z.object({
  title: z.string().trim().min(1),
  unit: z.string().trim(),
  target_value: z.coerce.number().int().positive(),
  due_date: z.string(),
})

type MilestoneFormValues = z.infer<typeof milestoneSchema>

function emptyValues(): MilestoneFormValues {
  return { title: '', unit: '', target_value: 1, due_date: '' }
}

function valuesFromMilestone(milestone: PlanMilestone): MilestoneFormValues {
  return {
    title: milestone.title,
    unit: milestone.unit ?? '',
    target_value: milestone.target_value,
    due_date: milestone.due_date ?? '',
  }
}

interface MilestoneFormProps {
  milestone: PlanMilestone | null
  planId: string
  onSaved: () => void
  onCancel: () => void
}

function MilestoneForm({
  milestone,
  planId,
  onSaved,
  onCancel,
}: MilestoneFormProps) {
  const t = useTranslations('Plans')
  const createMilestone = useCreateMilestone()
  const updateMilestone = useUpdateMilestone()

  const [values, setValues] = useState<MilestoneFormValues>(() =>
    milestone ? valuesFromMilestone(milestone) : emptyValues(),
  )

  const isPending = createMilestone.isPending || updateMilestone.isPending

  function updateField<K extends keyof MilestoneFormValues>(
    key: K,
    value: MilestoneFormValues[K],
  ): void {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(): Promise<void> {
    const result = milestoneSchema.safeParse(values)
    if (!result.success) return

    const payload = {
      title: result.data.title,
      unit: result.data.unit || null,
      target_value: result.data.target_value,
      due_date: result.data.due_date || null,
    }

    try {
      if (milestone) {
        await updateMilestone.mutateAsync({
          id: milestone.id,
          planId,
          payload,
        })
      } else {
        await createMilestone.mutateAsync({
          ...payload,
          plan_id: planId,
          current_value: 0,
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
        <DialogTitle>{t('newMilestone')}</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-foreground mb-1.5 block text-sm font-medium">
            {t('fieldTitle')}
          </label>
          <Input
            value={values.title}
            onChange={(e) => updateField('title', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {t('fieldUnit')}
            </label>
            <Input
              value={values.unit}
              onChange={(e) => updateField('unit', e.target.value)}
            />
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {t('fieldTarget')}
            </label>
            <Input
              type="number"
              min={1}
              value={values.target_value}
              onChange={(e) =>
                updateField('target_value', Number(e.target.value))
              }
            />
          </div>
        </div>
        <div>
          <label className="text-foreground mb-1.5 block text-sm font-medium">
            {t('fieldDueDate')}
          </label>
          <Input
            type="date"
            value={values.due_date}
            onChange={(e) => updateField('due_date', e.target.value)}
          />
        </div>
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

interface MilestoneFormDialogProps {
  open: boolean
  milestone: PlanMilestone | null
  planId: string
  onOpenChange: (open: boolean) => void
}

export function MilestoneFormDialog({
  open,
  milestone,
  planId,
  onOpenChange,
}: MilestoneFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <MilestoneForm
            key={milestone?.id ?? 'new'}
            milestone={milestone}
            planId={planId}
            onSaved={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
