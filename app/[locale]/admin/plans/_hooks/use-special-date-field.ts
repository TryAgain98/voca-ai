'use client'

import { useState } from 'react'

import {
  emptySpecialDateValues,
  isSpecialDateValid,
  specialDateValuesFromTemplate,
} from '../_utils/template-form-values'

import type {
  SpecialDateMode,
  SpecialDateValues,
} from '../_utils/template-form-values'
import type { TaskTemplate } from '~/types'

export interface SpecialDateFieldPayload {
  special_dates: string[] | null
  special_date_start: string | null
  special_date_end: string | null
}

export function useSpecialDateField(template: TaskTemplate | null) {
  const [values, setValues] = useState<SpecialDateValues>(() =>
    template
      ? specialDateValuesFromTemplate(template)
      : emptySpecialDateValues(),
  )
  const [hasError, setHasError] = useState(false)

  function validate(isActive: boolean): boolean {
    if (!isActive) {
      setHasError(false)
      return true
    }
    const valid = isSpecialDateValid(values)
    setHasError(!valid)
    return valid
  }

  function toPayload(isActive: boolean): SpecialDateFieldPayload {
    return {
      special_dates: isActive && values.mode === 'dates' ? values.dates : null,
      special_date_start:
        isActive && values.mode === 'range' ? values.rangeStart : null,
      special_date_end:
        isActive && values.mode === 'range' ? values.rangeEnd : null,
    }
  }

  return {
    values,
    hasError,
    onModeChange: (mode: SpecialDateMode) =>
      setValues((prev) => ({ ...prev, mode })),
    onDatesChange: (dates: string[]) =>
      setValues((prev) => ({ ...prev, dates })),
    onRangeChange: (rangeStart: string, rangeEnd: string) =>
      setValues((prev) => ({ ...prev, rangeStart, rangeEnd })),
    validate,
    toPayload,
  }
}
