'use client'

import { useUser } from '@clerk/nextjs'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { usePlans } from '~/hooks/use-plans'
import {
  useDeleteTaskTemplate,
  useTaskTemplates,
} from '~/hooks/use-task-templates'

import { PlanTabsNav } from '../_components/plan-tabs-nav'
import { TemplateChatInput } from '../_components/template-chat-input'
import { TemplateFormDialog } from '../_components/template-form-dialog'
import { TemplateRow } from '../_components/template-row'

import type { RecurrenceKind, TaskTemplate } from '~/types'

const SECTIONS: { kind: RecurrenceKind; labelKey: string }[] = [
  { kind: 'weekday', labelKey: 'weekdaySection' },
  { kind: 'weekend', labelKey: 'weekendSection' },
  { kind: 'special_date', labelKey: 'specialDateSection' },
]

export default function TemplatesPage() {
  const t = useTranslations('TaskTemplates')
  const { user } = useUser()
  const userId = user?.id ?? ''

  const { data: templates = [] } = useTaskTemplates(userId)
  const { data: plans = [] } = usePlans(userId)
  const deleteTemplate = useDeleteTaskTemplate()

  const [formOpen, setFormOpen] = useState(false)
  const [formKind, setFormKind] = useState<RecurrenceKind>('weekday')
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(
    null,
  )

  const planTitleById = Object.fromEntries(plans.map((p) => [p.id, p.title]))

  function openCreateForm(kind: RecurrenceKind): void {
    setFormKind(kind)
    setEditingTemplate(null)
    setFormOpen(true)
  }

  function openEditForm(template: TaskTemplate): void {
    setFormKind(template.recurrence_kind)
    setEditingTemplate(template)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <PlanTabsNav active="templates" />

      <div className="min-w-0">
        <h1 className="text-2xl leading-7 font-semibold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-0.5 text-sm leading-5">
          {t('pageDescription')}
        </p>
      </div>

      <TemplateChatInput userId={userId} />

      <div className="flex flex-col gap-6">
        {SECTIONS.map((section) => {
          const sectionTemplates = templates.filter(
            (tpl) => tpl.recurrence_kind === section.kind,
          )
          return (
            <div key={section.kind} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-[510]">{t(section.labelKey)}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => openCreateForm(section.kind)}
                >
                  <Plus size={14} />
                  {t('newTemplate')}
                </Button>
              </div>
              {sectionTemplates.length === 0 && (
                <p className="text-muted-foreground text-sm">{t('empty')}</p>
              )}
              {sectionTemplates.map((tpl) => (
                <TemplateRow
                  key={tpl.id}
                  template={tpl}
                  userId={userId}
                  planTitle={
                    tpl.plan_id ? (planTitleById[tpl.plan_id] ?? null) : null
                  }
                  onEdit={() => openEditForm(tpl)}
                  onDelete={() => deleteTemplate.mutate({ id: tpl.id, userId })}
                />
              ))}
            </div>
          )
        })}
      </div>

      <TemplateFormDialog
        open={formOpen}
        template={editingTemplate}
        userId={userId}
        recurrenceKind={formKind}
        onOpenChange={setFormOpen}
      />
    </div>
  )
}
