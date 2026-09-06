import { dayjs } from '~/lib/dayjs'
import { supabase } from '~/lib/supabase'

import { dailyTasksService } from './daily-tasks.service'
import { taskTemplatesService } from './task-templates.service'

import type {
  DailyTaskInsert,
  DailyTaskOriginKind,
  TaskTemplate,
} from '~/types'

const UNIQUE_VIOLATION_CODE = '23505'
const WEEKEND_DAYS_OF_WEEK = [0, 6]

export interface GenerationResult {
  didGenerate: boolean
  insertedCount: number
}

export interface ApplicableTemplates {
  templates: TaskTemplate[]
  originKind: DailyTaskOriginKind
}

class DailyTaskGenerationService {
  async ensureGeneratedForDate(
    userId: string,
    date: string,
  ): Promise<GenerationResult> {
    const didClaim = await this.claimSlot(userId, date)
    if (!didClaim) return { didGenerate: false, insertedCount: 0 }

    const { templates, originKind } = await this.resolveApplicableTemplates(
      userId,
      date,
    )
    if (templates.length === 0) return { didGenerate: true, insertedCount: 0 }

    const payload: DailyTaskInsert[] = templates.map((template) => ({
      user_id: userId,
      plan_id: template.plan_id,
      milestone_id: template.milestone_id,
      task_date: date,
      start_time: template.start_time,
      end_time: template.end_time,
      title: template.title,
      note: template.note,
      origin_template_id: template.id,
      origin_kind: originKind,
      needs_review: false,
      needs_check: template.needs_check,
    }))

    const inserted = await dailyTasksService.createMany(payload)
    return { didGenerate: true, insertedCount: inserted.length }
  }

  async backfillTemplateForDate(
    userId: string,
    template: TaskTemplate,
    date: string,
  ): Promise<void> {
    if (!this.templateMatchesDate(template, date)) return

    const existing = await dailyTasksService.findByDate(userId, date)
    const alreadyPresent = existing.some(
      (task) => task.origin_template_id === template.id,
    )
    if (alreadyPresent) return

    await dailyTasksService.createMany([
      {
        user_id: userId,
        plan_id: template.plan_id,
        milestone_id: template.milestone_id,
        task_date: date,
        start_time: template.start_time,
        end_time: template.end_time,
        title: template.title,
        note: template.note,
        origin_template_id: template.id,
        origin_kind: template.recurrence_kind,
        needs_review: false,
        needs_check: template.needs_check,
      },
    ])
  }

  templateMatchesDate(template: TaskTemplate, date: string): boolean {
    if (template.recurrence_kind === 'special_date') {
      if (template.special_dates?.includes(date)) return true
      if (template.special_date_start && template.special_date_end) {
        return (
          date >= template.special_date_start &&
          date <= template.special_date_end
        )
      }
      return false
    }
    const isWeekend = WEEKEND_DAYS_OF_WEEK.includes(dayjs(date).day())
    return template.recurrence_kind === (isWeekend ? 'weekend' : 'weekday')
  }

  async claimSlot(userId: string, date: string): Promise<boolean> {
    const { error } = await supabase
      .from('daily_task_generation_log')
      .insert({ user_id: userId, task_date: date })
    if (!error) return true
    if (error.code === UNIQUE_VIOLATION_CODE) return false
    throw error
  }

  async resolveApplicableTemplates(
    userId: string,
    date: string,
  ): Promise<ApplicableTemplates> {
    const specialTemplates = await taskTemplatesService.findSpecialDate(
      userId,
      date,
    )
    if (specialTemplates.length > 0) {
      return { templates: specialTemplates, originKind: 'special_date' }
    }

    const isWeekend = WEEKEND_DAYS_OF_WEEK.includes(dayjs(date).day())
    const originKind: DailyTaskOriginKind = isWeekend ? 'weekend' : 'weekday'
    const templates = await taskTemplatesService.findByKind(userId, originKind)
    return { templates, originKind }
  }
}

export const dailyTaskGenerationService = new DailyTaskGenerationService()
