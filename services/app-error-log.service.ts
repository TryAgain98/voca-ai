import { supabase } from '~/lib/supabase'

import type { AppErrorLogInsert } from '~/types'

type ErrorDetails = Record<string, unknown>

interface LogAppErrorParams {
  source: string
  action: string
  error: unknown
  userId?: string | null
  details?: ErrorDetails
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }
  return 'Unknown error'
}

function getErrorName(error: unknown): string | null {
  if (error instanceof Error) return error.name
  if (
    error &&
    typeof error === 'object' &&
    'name' in error &&
    typeof error.name === 'string'
  ) {
    return error.name
  }
  return null
}

function getErrorStack(error: unknown): string | null {
  if (error instanceof Error) return error.stack ?? null
  if (
    error &&
    typeof error === 'object' &&
    'stack' in error &&
    typeof error.stack === 'string'
  ) {
    return error.stack
  }
  return null
}

function toJsonSafe(value: unknown): unknown {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return String(value)
  }
}

class AppErrorLogService {
  async create(payload: AppErrorLogInsert): Promise<void> {
    const { error } = await supabase.from('app_error_logs').insert(payload)
    if (error) throw error
  }
}

export const appErrorLogService = new AppErrorLogService()

export function logAppError({
  source,
  action,
  error,
  userId = null,
  details = {},
}: LogAppErrorParams): void {
  const payload: AppErrorLogInsert = {
    user_id: userId,
    source,
    action,
    message: getErrorMessage(error),
    name: getErrorName(error),
    stack: getErrorStack(error),
    details: {
      error: toJsonSafe(error),
      ...details,
    },
    url: typeof window === 'undefined' ? null : window.location.href,
    user_agent: typeof navigator === 'undefined' ? null : navigator.userAgent,
  }

  void appErrorLogService.create(payload).catch((logError) => {
    console.warn('[app-error-log] failed to persist error log', logError)
  })
}
