'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { taskTemplatesService } from '~/services/task-templates.service'

import { backfillToday, taskTemplatesKey } from './use-task-templates'

import type { DailyTaskChatItem } from '~/providers/ai/types'
import type { RecurrenceKind, TaskTemplate, TaskTemplateInsert } from '~/types'

interface SubmitTemplateChatArgs {
  userId: string
  recurrenceKind: RecurrenceKind
  specialDates: string[] | null
  specialDateStart: string | null
  specialDateEnd: string | null
  message: string
}

export function useSubmitTemplateChatMessage() {
  const qc = useQueryClient()
  const t = useTranslations('TaskTemplates')
  return useMutation({
    mutationFn: async ({
      userId,
      recurrenceKind,
      specialDates,
      specialDateStart,
      specialDateEnd,
      message,
    }: SubmitTemplateChatArgs): Promise<TaskTemplate[]> => {
      const res = await fetch('/api/daily-tasks-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      if (!res.ok) throw new Error('Failed to parse chat message')
      const { items } = (await res.json()) as { items: DailyTaskChatItem[] }

      const payload: TaskTemplateInsert[] = items.map((item) => ({
        user_id: userId,
        recurrence_kind: recurrenceKind,
        special_dates: recurrenceKind === 'special_date' ? specialDates : null,
        special_date_start:
          recurrenceKind === 'special_date' ? specialDateStart : null,
        special_date_end:
          recurrenceKind === 'special_date' ? specialDateEnd : null,
        plan_id: null,
        milestone_id: null,
        title: item.title,
        note: item.note,
        start_time: item.start_time,
        end_time: item.end_time,
        needs_check: true,
        sort_order: 0,
      }))

      return taskTemplatesService.createMany(payload)
    },
    onSuccess: async (data, vars) => {
      qc.invalidateQueries({ queryKey: taskTemplatesKey(vars.userId) })
      for (const template of data) {
        await backfillToday(qc, vars.userId, template)
      }
      toast.success(t('chatSuccess', { count: data.length }))
    },
    onError: () => toast.error(t('chatFailed')),
  })
}
