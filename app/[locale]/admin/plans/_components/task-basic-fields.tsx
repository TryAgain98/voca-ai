'use client'

import { useTranslations } from 'next-intl'

import { Input } from '~/components/ui/input'
import { Switch } from '~/components/ui/switch'

interface TaskBasicFieldsValues {
  title: string
  note: string
  start_time: string
  end_time: string
  needs_check: boolean
}

interface TaskBasicFieldsProps {
  values: TaskBasicFieldsValues
  hasInvalidRange: boolean
  onChange: <K extends keyof TaskBasicFieldsValues>(
    key: K,
    value: TaskBasicFieldsValues[K],
  ) => void
}

export function TaskBasicFields({
  values,
  hasInvalidRange,
  onChange,
}: TaskBasicFieldsProps) {
  const t = useTranslations('Daily')

  return (
    <>
      <div>
        <label className="text-foreground mb-1.5 block text-sm font-medium">
          {t('fieldTitle')}
        </label>
        <Input
          value={values.title}
          onChange={(e) => onChange('title', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-foreground mb-1.5 block text-sm font-medium">
            {t('fieldStartTime')}
          </label>
          <Input
            type="time"
            value={values.start_time}
            onChange={(e) => onChange('start_time', e.target.value)}
          />
        </div>
        <div>
          <label className="text-foreground mb-1.5 block text-sm font-medium">
            {t('fieldEndTime')}
          </label>
          <Input
            type="time"
            value={values.end_time}
            onChange={(e) => onChange('end_time', e.target.value)}
            aria-invalid={hasInvalidRange}
          />
        </div>
      </div>
      {hasInvalidRange && (
        <p className="text-destructive text-xs">{t('invalidRange')}</p>
      )}

      <div>
        <label className="text-foreground mb-1.5 block text-sm font-medium">
          {t('fieldNote')}
        </label>
        <Input
          value={values.note}
          onChange={(e) => onChange('note', e.target.value)}
        />
      </div>

      <div className="border-border flex items-start justify-between gap-3 rounded-md border p-3">
        <div>
          <p className="text-foreground text-sm font-medium">
            {t('fieldNeedsCheck')}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {t('fieldNeedsCheckHint')}
          </p>
        </div>
        <Switch
          checked={values.needs_check}
          onCheckedChange={(checked) => onChange('needs_check', checked)}
        />
      </div>
    </>
  )
}
