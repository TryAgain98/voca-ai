'use client'

import { useUser } from '@clerk/nextjs'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { useDeletePlan, usePlans } from '~/hooks/use-plans'

import { PlanCard } from '../_components/plan-card'
import { PlanDeleteDialog } from '../_components/plan-delete-dialog'
import { PlanFormDialog } from '../_components/plan-form-dialog'
import { PlanTabsNav } from '../_components/plan-tabs-nav'

import type { Plan } from '~/types'

export default function PlansPage() {
  const t = useTranslations('Plans')
  const { user } = useUser()
  const userId = user?.id ?? ''

  const { data: plans = [], isLoading } = usePlans(userId)
  const deletePlan = useDeletePlan()

  const [formOpen, setFormOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null)

  function openCreateForm(): void {
    setEditingPlan(null)
    setFormOpen(true)
  }

  function openEditForm(plan: Plan): void {
    setEditingPlan(plan)
    setFormOpen(true)
  }

  async function handleDeleteConfirm(): Promise<void> {
    if (!deletingPlan) return
    try {
      await deletePlan.mutateAsync({ id: deletingPlan.id, userId })
      setDeletingPlan(null)
    } catch {
      // The mutation hook shows the error toast.
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <PlanTabsNav active="long-term" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl leading-7 font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm leading-5">
            {t('description')}
          </p>
        </div>
        <Button className="w-full gap-2 sm:w-auto" onClick={openCreateForm}>
          <Plus size={16} />
          {t('new')}
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-muted h-32 animate-pulse rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && plans.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="text-foreground">{t('empty')}</p>
          <p className="text-muted-foreground text-sm">{t('emptyHint')}</p>
          <Button
            variant="outline"
            className="mt-2 gap-2"
            onClick={openCreateForm}
          >
            <Plus size={16} />
            {t('new')}
          </Button>
        </div>
      )}

      {!isLoading && plans.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={() => openEditForm(plan)}
              onDelete={() => setDeletingPlan(plan)}
            />
          ))}
        </div>
      )}

      <PlanFormDialog
        open={formOpen}
        plan={editingPlan}
        userId={userId}
        onOpenChange={setFormOpen}
      />
      <PlanDeleteDialog
        plan={deletingPlan}
        isPending={deletePlan.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingPlan(null)}
      />
    </div>
  )
}
