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
import { useCreatePlan, useUpdatePlan } from '~/hooks/use-plans'

import type { Plan } from '~/types'

const planSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim(),
  start_date: z.string().min(1),
  target_date: z.string().min(1),
})

type PlanFormValues = z.infer<typeof planSchema>

function emptyValues(): PlanFormValues {
  return { title: '', description: '', start_date: '', target_date: '' }
}

function valuesFromPlan(plan: Plan): PlanFormValues {
  return {
    title: plan.title,
    description: plan.description ?? '',
    start_date: plan.start_date,
    target_date: plan.target_date,
  }
}

interface PlanFormProps {
  plan: Plan | null
  userId: string
  onSaved: () => void
  onCancel: () => void
}

function PlanForm({ plan, userId, onSaved, onCancel }: PlanFormProps) {
  const t = useTranslations('Plans')
  const createPlan = useCreatePlan()
  const updatePlan = useUpdatePlan()

  const [values, setValues] = useState<PlanFormValues>(() =>
    plan ? valuesFromPlan(plan) : emptyValues(),
  )

  const isPending = createPlan.isPending || updatePlan.isPending

  function updateField<K extends keyof PlanFormValues>(
    key: K,
    value: PlanFormValues[K],
  ): void {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(): Promise<void> {
    const result = planSchema.safeParse(values)
    if (!result.success) return

    try {
      if (plan) {
        await updatePlan.mutateAsync({
          id: plan.id,
          userId,
          payload: result.data,
        })
      } else {
        await createPlan.mutateAsync({
          ...result.data,
          user_id: userId,
          status: 'active',
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
        <DialogTitle>{plan ? t('formEdit') : t('formTitle')}</DialogTitle>
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
        <div>
          <label className="text-foreground mb-1.5 block text-sm font-medium">
            {t('fieldDescription')}
          </label>
          <Input
            value={values.description}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {t('fieldStartDate')}
            </label>
            <Input
              type="date"
              value={values.start_date}
              onChange={(e) => updateField('start_date', e.target.value)}
            />
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {t('fieldTargetDate')}
            </label>
            <Input
              type="date"
              value={values.target_date}
              onChange={(e) => updateField('target_date', e.target.value)}
            />
          </div>
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

interface PlanFormDialogProps {
  open: boolean
  plan: Plan | null
  userId: string
  onOpenChange: (open: boolean) => void
}

export function PlanFormDialog({
  open,
  plan,
  userId,
  onOpenChange,
}: PlanFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <PlanForm
            key={plan?.id ?? 'new'}
            plan={plan}
            userId={userId}
            onSaved={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
