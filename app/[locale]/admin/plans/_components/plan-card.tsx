'use client'

import { Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import { Progress } from '~/components/ui/progress'
import { usePlanWithMilestones } from '~/hooks/use-plans'
import { dayjs } from '~/lib/dayjs'

import type { Plan } from '~/types'

interface PlanCardProps {
  plan: Plan
  onEdit: () => void
  onDelete: () => void
}

export function PlanCard({ plan, onEdit, onDelete }: PlanCardProps) {
  const t = useTranslations('Plans')
  const locale = useLocale()
  const { data: withMilestones } = usePlanWithMilestones(plan.id)

  const milestones = withMilestones?.milestones ?? []
  const totalTarget = milestones.reduce((sum, m) => sum + m.target_value, 0)
  const totalCurrent = milestones.reduce((sum, m) => sum + m.current_value, 0)
  const progress = totalTarget > 0 ? Math.min(1, totalCurrent / totalTarget) : 0
  const daysLeft = Math.max(0, dayjs(plan.target_date).diff(dayjs(), 'day'))

  return (
    <div className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/${locale}/admin/plans/${plan.id}`}
            className="text-foreground font-[510] hover:underline"
          >
            {plan.title}
          </Link>
          <p className="text-muted-foreground text-xs">
            {dayjs(plan.start_date).format('DD/MM/YYYY')} –{' '}
            {dayjs(plan.target_date).format('DD/MM/YYYY')}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onEdit}>
            <Pencil size={14} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}>
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <Progress value={progress * 100}>
        <div className="flex w-full items-center justify-between text-xs">
          <span className="text-muted-foreground">{t('progress')}</span>
          <span className="text-muted-foreground">
            {Math.round(progress * 100)}%
          </span>
        </div>
      </Progress>

      <p className="text-muted-foreground text-xs">
        {t('daysLeft', { days: daysLeft })}
      </p>
    </div>
  )
}
