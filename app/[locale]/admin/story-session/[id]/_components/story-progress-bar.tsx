'use client'

import { BookOpen, CheckCircle2, Keyboard, ListChecks } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '~/lib/cn'

import type { StoryActivityType } from '~/types'

const STEPS: { type: StoryActivityType; icon: React.ReactNode }[] = [
  { type: 'read', icon: <BookOpen size={14} /> },
  { type: 'quiz', icon: <ListChecks size={14} /> },
  { type: 'type', icon: <Keyboard size={14} /> },
]

interface StoryProgressBarProps {
  completedActivities: StoryActivityType[]
  currentActivity: StoryActivityType
}

export function StoryProgressBar({
  completedActivities,
  currentActivity,
}: StoryProgressBarProps) {
  const t = useTranslations('Story')

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, i) => {
        const isDone = completedActivities.includes(step.type)
        const isActive = step.type === currentActivity

        return (
          <div key={step.type} className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-[510] transition-colors',
                isDone
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground bg-muted',
              )}
            >
              {isDone ? <CheckCircle2 size={13} /> : step.icon}
              {t(`activity.${step.type}`)}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-px w-6 transition-colors',
                  isDone ? 'bg-emerald-500/40' : 'bg-border',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
