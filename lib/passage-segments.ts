import type { PassageSegment } from '~/types'

export function segmentsFromContent(content: string): PassageSegment[] {
  return content
    .split(/(?<=[.!?])\s+|(?<=[,;])\s+/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text, i) => ({ id: `s${i + 1}`, text }))
}
