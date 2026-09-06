'use client'

import { BookmarkPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button, buttonVariants } from '~/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { useCreateTaskTemplate } from '~/hooks/use-task-templates'
import { cn } from '~/lib/cn'

import type { DailyTask, RecurrenceKind } from '~/types'

const RECURRENCE_OPTIONS: { kind: RecurrenceKind; labelKey: string }[] = [
  { kind: 'weekday', labelKey: 'groupWeekday' },
  { kind: 'weekend', labelKey: 'groupWeekend' },
  { kind: 'special_date', labelKey: 'groupSpecialDate' },
]

interface TaskSaveAsTemplateButtonProps {
  task: DailyTask
}

export function TaskSaveAsTemplateButton({
  task,
}: TaskSaveAsTemplateButtonProps) {
  const t = useTranslations('Daily')
  const createTemplate = useCreateTaskTemplate()
  const [open, setOpen] = useState(false)

  function handleSave(kind: RecurrenceKind): void {
    createTemplate.mutate({
      user_id: task.user_id,
      recurrence_kind: kind,
      special_dates: kind === 'special_date' ? [task.task_date] : null,
      special_date_start: null,
      special_date_end: null,
      plan_id: task.plan_id,
      milestone_id: task.milestone_id,
      title: task.title,
      note: task.note,
      start_time: task.start_time,
      end_time: task.end_time,
      needs_check: task.needs_check,
      sort_order: 0,
    })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
          'shrink-0',
        )}
        aria-label={t('saveAsTemplate')}
      >
        <BookmarkPlus size={14} />
      </PopoverTrigger>
      <PopoverContent className="w-56 gap-1 p-1" align="end">
        <p className="text-muted-foreground px-2 py-1.5 text-xs">
          {t('saveAsTemplateHint')}
        </p>
        {RECURRENCE_OPTIONS.map((option) => (
          <Button
            key={option.kind}
            variant="ghost"
            size="sm"
            className="justify-start"
            disabled={createTemplate.isPending}
            onClick={() => handleSave(option.kind)}
          >
            {t(option.labelKey)}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
