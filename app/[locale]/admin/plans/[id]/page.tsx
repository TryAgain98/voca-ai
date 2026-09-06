'use client'

import { useUser } from '@clerk/nextjs'
import { Loader2, Plus } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { useDeleteMilestone } from '~/hooks/use-plan-milestones'
import { usePlanWithMilestones } from '~/hooks/use-plans'
import { dayjs } from '~/lib/dayjs'

import { MilestoneFormDialog } from './_components/milestone-form-dialog'
import { MilestoneRow } from './_components/milestone-row'

import type { PlanMilestone } from '~/types'

export default function PlanDetailPage() {
  const t = useTranslations('Plans')
  const params = useParams<{ id: string }>()
  const { user } = useUser()
  const userId = user?.id ?? ''
  const { data: plan, isLoading } = usePlanWithMilestones(params.id, userId)
  const deleteMilestone = useDeleteMilestone()

  const [formOpen, setFormOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] =
    useState<PlanMilestone | null>(null)

  function openCreateForm(): void {
    setEditingMilestone(null)
    setFormOpen(true)
  }

  function openEditForm(milestone: PlanMilestone): void {
    setEditingMilestone(milestone)
    setFormOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 size={28} className="text-muted-foreground animate-spin" />
      </div>
    )
  }

  if (!plan) return null

  const daysLeft = Math.max(0, dayjs(plan.target_date).diff(dayjs(), 'day'))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl leading-7 font-semibold tracking-tight">
          {plan.title}
        </h1>
        {plan.description && (
          <p className="text-muted-foreground mt-1 text-sm">
            {plan.description}
          </p>
        )}
        <p className="text-muted-foreground mt-1 text-sm">
          {t('daysLeft', { days: daysLeft })}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-[510]">{t('milestones')}</h2>
        <Button size="sm" className="gap-1.5" onClick={openCreateForm}>
          <Plus size={14} />
          {t('newMilestone')}
        </Button>
      </div>

      {plan.milestones.length === 0 && (
        <p className="text-muted-foreground text-sm">{t('milestoneEmpty')}</p>
      )}

      <div className="flex flex-col gap-2">
        {plan.milestones.map((milestone) => (
          <MilestoneRow
            key={milestone.id}
            milestone={milestone}
            planId={plan.id}
            onEdit={() => openEditForm(milestone)}
            onDelete={() =>
              deleteMilestone.mutate({ id: milestone.id, planId: plan.id })
            }
          />
        ))}
      </div>

      <MilestoneFormDialog
        open={formOpen}
        milestone={editingMilestone}
        planId={plan.id}
        onOpenChange={setFormOpen}
      />
    </div>
  )
}
