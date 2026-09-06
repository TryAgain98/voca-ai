'use client'

import { Minus, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import { Progress } from '~/components/ui/progress'
import { useSetMilestoneProgress } from '~/hooks/use-plan-milestones'

import type { PlanMilestone } from '~/types'

interface MilestoneRowProps {
  milestone: PlanMilestone
  planId: string
  onEdit: () => void
  onDelete: () => void
}

export function MilestoneRow({
  milestone,
  planId,
  onEdit,
  onDelete,
}: MilestoneRowProps) {
  const t = useTranslations('Plans')
  const setProgress = useSetMilestoneProgress()

  const progress =
    milestone.target_value > 0
      ? Math.min(1, milestone.current_value / milestone.target_value)
      : 0

  function adjust(delta: number): void {
    setProgress.mutate({
      id: milestone.id,
      planId,
      currentValue: milestone.current_value + delta,
    })
  }

  return (
    <div className="border-border bg-card flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-foreground text-sm font-[510]">
            {milestone.title}
          </p>
          {milestone.due_date && (
            <p className="text-muted-foreground text-xs">
              {t('fieldDueDate')}: {milestone.due_date}
            </p>
          )}
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

      <Progress value={progress * 100} />

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => adjust(-1)}
          disabled={milestone.current_value <= 0}
        >
          <Minus size={14} />
        </Button>
        <span className="text-muted-foreground text-sm tabular-nums">
          {milestone.current_value} / {milestone.target_value}
          {milestone.unit ? ` ${milestone.unit}` : ''}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => adjust(1)}
          disabled={milestone.current_value >= milestone.target_value}
        >
          <Plus size={14} />
        </Button>
      </div>
    </div>
  )
}
