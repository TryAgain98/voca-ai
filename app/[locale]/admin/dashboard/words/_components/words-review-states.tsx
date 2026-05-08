'use client'

import type { TabVisual } from '../_types/words-review.types'

interface TabEmptyStateProps {
  visual: TabVisual
  message: string
}

export function TabEmptyState({ visual, message }: TabEmptyStateProps) {
  const Icon = visual.emptyIcon
  return (
    <div className="border-border bg-card/40 flex flex-col items-center justify-center gap-3 rounded-xl border px-6 py-14 text-center">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${visual.iconBg} ${visual.iconText}`}
      >
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
        {message}
      </p>
    </div>
  )
}
