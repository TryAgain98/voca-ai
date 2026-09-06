import { cleanJson } from './utils'

import type { DailyTaskChatItem } from './types'

export function buildDailyTaskChatPrompt(message: string): string {
  return `You are a scheduling assistant for a Vietnamese user listing out their tasks for the day in free-form text (mixed Vietnamese/English, casual shorthand for time like "7h", "22h30", "14h-15h30").

Message: "${message}"

Parse this into a JSON array of task objects. For each task return:
- "title": short task name (keep the user's own wording, just cleaned up)
- "start_time": "HH:mm" 24-hour format
- "end_time": "HH:mm" 24-hour format — if the user gave no end time, infer a 60-minute duration after start_time (cap at "23:59")
- "note": any extra detail mentioned for that task, else null
- "needs_review": true ONLY if the user explicitly flags the task as new/uncertain/needing a check (phrases like "việc mới", "cần check", "chưa chắc", "mới thêm", "new task", "need to check") — otherwise false

Rules:
- One object per distinct task mentioned.
- end_time must be strictly after start_time.
- If no time is mentioned at all for a task, skip it (do not guess a time).
- Return ONLY a valid JSON array, no markdown fences, no explanation:
[{"title": "Tập thể dục", "start_time": "07:00", "end_time": "08:00", "note": null, "needs_review": false}]`
}

export function parseDailyTasksChatResult(raw: string): DailyTaskChatItem[] {
  const cleaned = cleanJson(raw)
  const parsed = JSON.parse(cleaned) as Partial<DailyTaskChatItem>[]

  return parsed
    .filter(
      (item): item is DailyTaskChatItem =>
        !!item.title &&
        !!item.start_time &&
        !!item.end_time &&
        item.end_time > item.start_time,
    )
    .map((item) => ({
      title: item.title,
      start_time: item.start_time,
      end_time: item.end_time,
      note: item.note ?? null,
      needs_review: item.needs_review === true,
    }))
}
