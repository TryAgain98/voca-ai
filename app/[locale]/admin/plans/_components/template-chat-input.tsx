'use client'

import { Bot, Loader2, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { useSubmitTemplateChatMessage } from '~/hooks/use-template-chat'
import { cn } from '~/lib/cn'

import { useSpecialDateField } from '../_hooks/use-special-date-field'

import { TemplateSpecialDateFields } from './template-special-date-fields'

import type { RecurrenceKind } from '~/types'

const RECURRENCE_OPTIONS: { kind: RecurrenceKind; labelKey: string }[] = [
  { kind: 'weekday', labelKey: 'weekdaySection' },
  { kind: 'weekend', labelKey: 'weekendSection' },
  { kind: 'special_date', labelKey: 'specialDateSection' },
]

interface TemplateChatInputProps {
  userId: string
}

export function TemplateChatInput({ userId }: TemplateChatInputProps) {
  const t = useTranslations('TaskTemplates')
  const [recurrenceKind, setRecurrenceKind] =
    useState<RecurrenceKind>('weekday')
  const specialDate = useSpecialDateField(null)
  const [message, setMessage] = useState('')
  const submitMessage = useSubmitTemplateChatMessage()

  const isSpecialDate = recurrenceKind === 'special_date'

  function handleSend(): void {
    const trimmed = message.trim()
    if (!trimmed) return
    if (!specialDate.validate(isSpecialDate)) return
    const payload = specialDate.toPayload(isSpecialDate)
    submitMessage.mutate(
      {
        userId,
        recurrenceKind,
        specialDates: payload.special_dates,
        specialDateStart: payload.special_date_start,
        specialDateEnd: payload.special_date_end,
        message: trimmed,
      },
      { onSuccess: () => setMessage('') },
    )
  }

  return (
    <div className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-3">
      <div className="flex items-center gap-1.5">
        <Bot size={16} className="text-indigo-400" />
        <span className="text-foreground text-sm font-semibold">
          {t('chatTitle')}
        </span>
      </div>

      <div className="border-border bg-muted flex w-fit gap-1 rounded-md border p-1">
        {RECURRENCE_OPTIONS.map((option) => (
          <button
            key={option.kind}
            type="button"
            onClick={() => setRecurrenceKind(option.kind)}
            className={cn(
              'rounded-[4px] px-2.5 py-1 text-xs transition-colors',
              recurrenceKind === option.kind
                ? 'bg-accent text-accent-foreground font-[510]'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t(option.labelKey)}
          </button>
        ))}
      </div>

      {isSpecialDate && (
        <TemplateSpecialDateFields
          values={specialDate.values}
          hasError={specialDate.hasError}
          onModeChange={specialDate.onModeChange}
          onDatesChange={specialDate.onDatesChange}
          onRangeChange={specialDate.onRangeChange}
        />
      )}

      <div className="flex items-end gap-2">
        <Textarea
          value={message}
          placeholder={t('chatPlaceholder')}
          disabled={submitMessage.isPending}
          rows={2}
          className="bg-muted max-h-48 min-h-16 flex-1 resize-y rounded-xl border-none px-4 py-3"
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        <Button
          size="icon"
          className="size-10 shrink-0 rounded-full bg-indigo-600 hover:bg-indigo-500"
          disabled={submitMessage.isPending || !message.trim()}
          onClick={handleSend}
        >
          {submitMessage.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
        </Button>
      </div>
    </div>
  )
}
