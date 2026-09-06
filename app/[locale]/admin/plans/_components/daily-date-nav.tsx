'use client'

import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button, buttonVariants } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { cn } from '~/lib/cn'
import { dayjs } from '~/lib/dayjs'

interface DailyDateNavProps {
  date: string
  todayDate: string
  onDateChange: (date: string) => void
}

export function DailyDateNav({
  date,
  todayDate,
  onDateChange,
}: DailyDateNavProps) {
  const t = useTranslations('Daily')
  const format = useFormatter()
  const [open, setOpen] = useState(false)
  const isToday = date === todayDate

  function shiftDay(deltaDays: number): void {
    onDateChange(dayjs(date).add(deltaDays, 'day').format('YYYY-MM-DD'))
  }

  return (
    <div className="border-border bg-card flex items-center gap-0.5 rounded-md border p-0.5">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t('previousDay')}
        onClick={() => shiftDay(-1)}
      >
        <ChevronLeft size={14} />
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'min-w-36 gap-1.5 font-normal tabular-nums',
          )}
        >
          <CalendarIcon size={14} className="text-muted-foreground" />
          {format.dateTime(new Date(`${date}T00:00:00`), {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={new Date(`${date}T00:00:00`)}
            onSelect={(day) => {
              if (!day) return
              onDateChange(dayjs(day).format('YYYY-MM-DD'))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t('nextDay')}
        onClick={() => shiftDay(1)}
      >
        <ChevronRight size={14} />
      </Button>

      {!isToday && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateChange(todayDate)}
        >
          {t('today')}
        </Button>
      )}
    </div>
  )
}
