'use client'

import { useTranslations } from 'next-intl'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { usePlanWithMilestones, usePlans } from '~/hooks/use-plans'

export const NO_PLAN_VALUE = 'none'

interface TaskPlanMilestoneSelectProps {
  userId: string
  planId: string
  milestoneId: string
  onPlanChange: (planId: string) => void
  onMilestoneChange: (milestoneId: string) => void
}

export function TaskPlanMilestoneSelect({
  userId,
  planId,
  milestoneId,
  onPlanChange,
  onMilestoneChange,
}: TaskPlanMilestoneSelectProps) {
  const t = useTranslations('Today')
  const { data: plans = [] } = usePlans(userId)
  const { data: planDetail } = usePlanWithMilestones(
    planId === NO_PLAN_VALUE ? '' : planId,
    userId,
  )

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-foreground mb-1.5 block text-sm font-medium">
          {t('fieldPlan')}
        </label>
        <Select
          value={planId}
          onValueChange={(value) => value && onPlanChange(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_PLAN_VALUE}>{t('noPlan')}</SelectItem>
            {plans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-foreground mb-1.5 block text-sm font-medium">
          {t('fieldMilestone')}
        </label>
        <Select
          value={milestoneId}
          onValueChange={(value) => value && onMilestoneChange(value)}
          disabled={planId === NO_PLAN_VALUE}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_PLAN_VALUE}>{t('noPlan')}</SelectItem>
            {planDetail?.milestones.map((milestone) => (
              <SelectItem key={milestone.id} value={milestone.id}>
                {milestone.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
