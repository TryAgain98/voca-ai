'use client'

import { CalendarIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { buttonVariants } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { cn } from '~/lib/cn'
import { dayjs } from '~/lib/dayjs'

import type {
  SpecialDateMode,
  SpecialDateValues,
} from '../_utils/template-form-values'

const MODES: { mode: SpecialDateMode; labelKey: string }[] = [
  { mode: 'dates', labelKey: 'specialDateModeDates' },
  { mode: 'range', labelKey: 'specialDateModeRange' },
]

function toDate(value: string): Date {
  return new Date(`${value}T00:00:00`)
}

function toIso(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD')
}

interface TemplateSpecialDateFieldsProps {
  values: SpecialDateValues
  hasError: boolean
  onModeChange: (mode: SpecialDateMode) => void
  onDatesChange: (dates: string[]) => void
  onRangeChange: (rangeStart: string, rangeEnd: string) => void
}

export function TemplateSpecialDateFields({
  values,
  hasError,
  onModeChange,
  onDatesChange,
  onRangeChange,
}: TemplateSpecialDateFieldsProps) {
  const t = useTranslations('TaskTemplates')

  const summary =
    values.mode === 'dates'
      ? t('specialDatesSummary', { count: values.dates.length })
      : values.rangeStart && values.rangeEnd
        ? `${values.rangeStart} → ${values.rangeEnd}`
        : t('specialDateRangePlaceholder')

  return (
    <div>
      <label className="text-foreground mb-1.5 block text-sm font-medium">
        {t('fieldSpecialDate')}
      </label>

      <div className="border-border bg-muted mb-2 flex w-fit gap-1 rounded-md border p-1">
        {MODES.map((option) => (
          <button
            key={option.mode}
            type="button"
            onClick={() => onModeChange(option.mode)}
            className={cn(
              'rounded-[4px] px-2.5 py-1 text-xs transition-colors',
              values.mode === option.mode
                ? 'bg-accent text-accent-foreground font-[510]'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t(option.labelKey)}
          </button>
        ))}
      </div>

      <Popover>
        <PopoverTrigger
          type="button"
          aria-invalid={hasError}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-full justify-start gap-1.5 font-normal',
          )}
        >
          <CalendarIcon size={14} className="text-muted-foreground" />
          {summary}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {values.mode === 'dates' ? (
            <Calendar
              mode="multiple"
              selected={values.dates.map(toDate)}
              onSelect={(days) => onDatesChange((days ?? []).map(toIso))}
            />
          ) : (
            <Calendar
              mode="range"
              selected={{
                from: values.rangeStart ? toDate(values.rangeStart) : undefined,
                to: values.rangeEnd ? toDate(values.rangeEnd) : undefined,
              }}
              onSelect={(range) =>
                onRangeChange(
                  range?.from ? toIso(range.from) : '',
                  range?.to ? toIso(range.to) : '',
                )
              }
            />
          )}
        </PopoverContent>
      </Popover>
      {hasError && (
        <p className="text-destructive mt-1 text-xs">
          {t('invalidSpecialDate')}
        </p>
      )}
    </div>
  )
}
