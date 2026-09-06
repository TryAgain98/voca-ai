'use client'

import { useUser } from '@clerk/nextjs'
import { Bell, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { Switch } from '~/components/ui/switch'
import {
  usePlanReminderSettings,
  useUpsertPlanReminderSettings,
} from '~/hooks/use-plan-reminder-settings'

const TIMEZONES = ['Asia/Ho_Chi_Minh', 'UTC'] as const
const GRACE_MINUTES_OPTIONS = [0, 5, 10, 15, 30] as const
const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh'
const DEFAULT_GRACE_MINUTES = 5

export function PlanReminderCard() {
  const t = useTranslations('Settings')
  const { user } = useUser()
  const userId = user?.id ?? ''
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? ''

  const { data: settings } = usePlanReminderSettings(userId)
  const { mutate: saveSettings, isPending } = useUpsertPlanReminderSettings()

  const [syncedFor, setSyncedFor] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [email, setEmail] = useState('')
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE)
  const [graceMinutes, setGraceMinutes] = useState(DEFAULT_GRACE_MINUTES)

  if (settings && settings.user_id !== syncedFor) {
    setSyncedFor(settings.user_id)
    setEnabled(settings.is_enabled)
    setEmail(settings.email ?? userEmail)
    setTimezone(settings.timezone)
    setGraceMinutes(settings.grace_minutes)
  }

  function handleSave(): void {
    if (!userId) return
    saveSettings({
      user_id: userId,
      is_enabled: enabled,
      email: email || null,
      timezone,
      grace_minutes: graceMinutes,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Bell size={14} />
          {t('planReminderTitle')}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          {t('planReminderDescription')}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-[510]">{t('planReminderEnable')}</p>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        <div className="grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-muted-foreground text-xs font-[510] tracking-wide uppercase">
              {t('planReminderEmail')}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!enabled}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-muted-foreground text-xs font-[510] tracking-wide uppercase">
              {t('planReminderTimezone')}
            </label>
            <NativeSelect
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              disabled={!enabled}
              className="w-full"
            >
              {TIMEZONES.map((tz) => (
                <NativeSelectOption key={tz} value={tz}>
                  {tz}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-1.5">
            <label className="text-muted-foreground text-xs font-[510] tracking-wide uppercase">
              {t('planReminderGrace')}
            </label>
            <NativeSelect
              value={String(graceMinutes)}
              onChange={(e) => setGraceMinutes(parseInt(e.target.value, 10))}
              disabled={!enabled}
              className="w-full"
            >
              {GRACE_MINUTES_OPTIONS.map((minutes) => (
                <NativeSelectOption key={minutes} value={minutes}>
                  {minutes}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={isPending || !userId || !email}
        >
          {isPending && <Loader2 size={14} className="mr-2 animate-spin" />}
          {t('reminderSave')}
        </Button>
      </CardContent>
    </Card>
  )
}
