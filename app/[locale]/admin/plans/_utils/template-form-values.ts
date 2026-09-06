import { z } from 'zod'

import type { TaskTemplate } from '~/types'

export const templateSchema = z
  .object({
    title: z.string().trim().min(1),
    note: z.string().trim(),
    start_time: z.string().min(1),
    end_time: z.string().min(1),
    needs_check: z.boolean(),
  })
  .refine((v) => v.end_time > v.start_time, { path: ['end_time'] })

export type TemplateFormValues = z.infer<typeof templateSchema>

export function emptyTemplateValues(): TemplateFormValues {
  return {
    title: '',
    note: '',
    start_time: '',
    end_time: '',
    needs_check: true,
  }
}

export function templateValuesFromTemplate(
  template: TaskTemplate,
): TemplateFormValues {
  return {
    title: template.title,
    note: template.note ?? '',
    start_time: template.start_time.slice(0, 5),
    end_time: template.end_time.slice(0, 5),
    needs_check: template.needs_check,
  }
}

export type SpecialDateMode = 'dates' | 'range'

export interface SpecialDateValues {
  mode: SpecialDateMode
  dates: string[]
  rangeStart: string
  rangeEnd: string
}

export function emptySpecialDateValues(): SpecialDateValues {
  return { mode: 'dates', dates: [], rangeStart: '', rangeEnd: '' }
}

export function specialDateValuesFromTemplate(
  template: TaskTemplate,
): SpecialDateValues {
  if (template.special_date_start && template.special_date_end) {
    return {
      mode: 'range',
      dates: [],
      rangeStart: template.special_date_start,
      rangeEnd: template.special_date_end,
    }
  }
  return {
    mode: 'dates',
    dates: template.special_dates ?? [],
    rangeStart: '',
    rangeEnd: '',
  }
}

export function isSpecialDateValid(values: SpecialDateValues): boolean {
  if (values.mode === 'dates') return values.dates.length > 0
  return (
    !!values.rangeStart &&
    !!values.rangeEnd &&
    values.rangeEnd >= values.rangeStart
  )
}
