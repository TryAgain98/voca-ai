'use client'

import { useUser } from '@clerk/nextjs'
import { Bell, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Switch } from '~/components/ui/switch'
import { useStreak, useUpdateStreakReminder } from '~/hooks/use-streak'

const REMINDER_HOURS = [18, 19, 20, 21, 22] as const
const DEFAULT_HOUR = 20

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

function formatHour(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 || 12
  return `${display}:00 ${suffix}`
}

export function StreakReminderCard() {
  const t = useTranslations('Settings')
  const { user } = useUser()
  const userId = user?.id ?? ''
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? ''

  const { data: streak } = useStreak(userId)
  const { mutate: saveReminder, isPending } = useUpdateStreakReminder()

  const detectedTz = useMemo(() => detectTimezone(), [])
  const [syncedFor, setSyncedFor] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [hour, setHour] = useState<number>(DEFAULT_HOUR)

  if (streak && streak.user_id !== syncedFor) {
    setSyncedFor(streak.user_id)
    setEnabled(streak.email_reminders_enabled)
    setHour(streak.reminder_hour ?? DEFAULT_HOUR)
  }

  const handleSave = () => {
    if (!userId || !userEmail) return
    saveReminder({
      userId,
      prefs: {
        email_reminders_enabled: enabled,
        email: userEmail,
        timezone: detectedTz,
        reminder_hour: hour,
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Bell size={14} />
          {t('reminderTitle')}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          {t('reminderDescription')}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-sm font-[510]">{t('reminderToggleLabel')}</p>
            <p className="text-muted-foreground text-xs">
              {t('reminderToggleHint', { email: userEmail || '—' })}
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div className="space-y-1.5">
            <label className="text-muted-foreground text-xs font-[510] tracking-wide uppercase">
              {t('reminderHourLabel')}
            </label>
            <Select
              value={String(hour)}
              onValueChange={(v) => v && setHour(parseInt(v, 10))}
              disabled={!enabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REMINDER_HOURS.map((h) => (
                  <SelectItem key={h} value={String(h)}>
                    {formatHour(h)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-muted-foreground text-xs font-[510] tracking-wide uppercase">
              {t('reminderTimezoneLabel')}
            </label>
            <div className="border-input bg-background flex h-9 items-center rounded-md border px-3 text-sm">
              <span className="text-muted-foreground truncate">
                {detectedTz}
              </span>
            </div>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={isPending || !userId || !userEmail}
        >
          {isPending && <Loader2 size={14} className="mr-2 animate-spin" />}
          {t('reminderSave')}
        </Button>
      </CardContent>
    </Card>
  )
}
