'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import { useUpdateTaskTemplate } from '~/hooks/use-task-templates'

import type { TaskTemplate } from '~/types'

interface TemplateRowProps {
  template: TaskTemplate
  userId: string
  planTitle: string | null
  onEdit: () => void
  onDelete: () => void
}

export function TemplateRow({
  template,
  userId,
  planTitle,
  onEdit,
  onDelete,
}: TemplateRowProps) {
  const t = useTranslations('TaskTemplates')
  const updateTemplate = useUpdateTaskTemplate()

  return (
    <div className="border-border bg-card flex items-center gap-3 rounded-lg border p-3">
      <div className="text-muted-foreground w-28 shrink-0 text-xs tabular-nums">
        {template.start_time.slice(0, 5)} – {template.end_time.slice(0, 5)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-[510]">
          {template.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {planTitle && <Badge variant="outline">{planTitle}</Badge>}
          {!template.needs_check && (
            <Badge variant="outline" className="text-muted-foreground">
              {t('autoTag')}
            </Badge>
          )}
        </div>
      </div>
      <label className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-xs">
        {t('fieldNeedsCheck')}
        <Switch
          checked={template.needs_check}
          onCheckedChange={(checked) =>
            updateTemplate.mutate({
              id: template.id,
              userId,
              payload: { needs_check: checked },
            })
          }
        />
      </label>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="icon-sm" onClick={onEdit}>
          <Pencil size={14} />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onDelete}>
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  )
}
