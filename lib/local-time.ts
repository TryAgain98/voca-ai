export interface LocalParts {
  date: string
  minutesOfDay: number
}

export function localPartsInTz(tz: string, now: Date): LocalParts | null {
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    const parts = fmt.formatToParts(now)
    const get = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? ''
    const hourRaw = get('hour')
    const hour = parseInt(hourRaw === '24' ? '0' : hourRaw, 10)
    const minute = parseInt(get('minute'), 10)
    return {
      date: `${get('year')}-${get('month')}-${get('day')}`,
      minutesOfDay: hour * 60 + minute,
    }
  } catch {
    return null
  }
}

export function timeToMinutes(time: string): number {
  const [hourRaw, minuteRaw] = time.split(':')
  return parseInt(hourRaw, 10) * 60 + parseInt(minuteRaw, 10)
}

export function minutesToTime(minutes: number): string {
  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}
