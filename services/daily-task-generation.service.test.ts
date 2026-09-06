import { beforeEach, describe, expect, it, vi } from 'vitest'

import { dailyTaskGenerationService } from './daily-task-generation.service'

import type { TaskTemplate } from '~/types'

const { mockInsert, mockFrom, mockFindSpecialDate, mockFindByKind } =
  vi.hoisted(() => ({
    mockInsert: vi.fn(),
    mockFrom: vi.fn(),
    mockFindSpecialDate: vi.fn(),
    mockFindByKind: vi.fn(),
  }))
mockFrom.mockImplementation(() => ({ insert: mockInsert }))

vi.mock('~/lib/supabase', () => ({
  supabase: { from: mockFrom },
}))

vi.mock('./task-templates.service', () => ({
  taskTemplatesService: {
    findSpecialDate: mockFindSpecialDate,
    findByKind: mockFindByKind,
  },
}))

function makeTemplate(overrides: Partial<TaskTemplate> = {}): TaskTemplate {
  return {
    id: 'tmpl-1',
    user_id: 'user-1',
    recurrence_kind: 'weekday',
    special_dates: null,
    special_date_start: null,
    special_date_end: null,
    plan_id: null,
    milestone_id: null,
    title: 'Tập thể dục',
    note: null,
    start_time: '07:00',
    end_time: '08:00',
    needs_check: true,
    sort_order: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

beforeEach(() => {
  mockInsert.mockReset()
  mockFrom.mockClear()
  mockFindSpecialDate.mockReset()
  mockFindByKind.mockReset()
})

describe('resolveApplicableTemplates', () => {
  it('returns special_date templates when present, overriding weekday/weekend', async () => {
    const special = [
      makeTemplate({
        recurrence_kind: 'special_date',
        special_dates: ['2026-09-07'],
      }),
    ]
    mockFindSpecialDate.mockResolvedValue(special)

    const result = await dailyTaskGenerationService.resolveApplicableTemplates(
      'user-1',
      '2026-09-07',
    )

    expect(result).toEqual({ templates: special, originKind: 'special_date' })
    expect(mockFindByKind).not.toHaveBeenCalled()
  })

  it('falls back to weekday templates on a weekday with no special_date override', async () => {
    mockFindSpecialDate.mockResolvedValue([])
    const weekday = [makeTemplate()]
    mockFindByKind.mockResolvedValue(weekday)

    // 2026-09-07 is a Monday
    const result = await dailyTaskGenerationService.resolveApplicableTemplates(
      'user-1',
      '2026-09-07',
    )

    expect(mockFindByKind).toHaveBeenCalledWith('user-1', 'weekday')
    expect(result).toEqual({ templates: weekday, originKind: 'weekday' })
  })

  it('falls back to weekend templates on a Saturday/Sunday with no special_date override', async () => {
    mockFindSpecialDate.mockResolvedValue([])
    const weekend = [makeTemplate({ recurrence_kind: 'weekend' })]
    mockFindByKind.mockResolvedValue(weekend)

    // 2026-09-12 is a Saturday
    const result = await dailyTaskGenerationService.resolveApplicableTemplates(
      'user-1',
      '2026-09-12',
    )

    expect(mockFindByKind).toHaveBeenCalledWith('user-1', 'weekend')
    expect(result).toEqual({ templates: weekend, originKind: 'weekend' })
  })
})

describe('claimSlot', () => {
  it('returns true when the log row inserts cleanly', async () => {
    mockInsert.mockResolvedValue({ error: null })

    const didClaim = await dailyTaskGenerationService.claimSlot(
      'user-1',
      '2026-09-07',
    )

    expect(didClaim).toBe(true)
    expect(mockFrom).toHaveBeenCalledWith('daily_task_generation_log')
  })

  it('returns false when the date was already claimed (unique violation)', async () => {
    mockInsert.mockResolvedValue({
      error: { code: '23505', message: 'duplicate key' },
    })

    const didClaim = await dailyTaskGenerationService.claimSlot(
      'user-1',
      '2026-09-07',
    )

    expect(didClaim).toBe(false)
  })

  it('rethrows any other database error', async () => {
    mockInsert.mockResolvedValue({
      error: { code: '42501', message: 'permission denied' },
    })

    await expect(
      dailyTaskGenerationService.claimSlot('user-1', '2026-09-07'),
    ).rejects.toMatchObject({ code: '42501' })
  })
})
