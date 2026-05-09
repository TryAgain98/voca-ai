'use client'

import { Loader2, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface SuggestionHintProps {
  suggestion: string | null
  isLoading: boolean
}

export function SuggestionHint({ suggestion, isLoading }: SuggestionHintProps) {
  const t = useTranslations('Common')

  if (!isLoading && !suggestion) return null

  return (
    <div className="border-border bg-muted/40 flex items-start gap-2 rounded-md border border-dashed px-3 py-1.5">
      {isLoading ? (
        <>
          <Loader2
            size={12}
            className="text-muted-foreground mt-0.5 shrink-0 animate-spin"
          />
          <span className="text-muted-foreground text-xs">
            {t('suggesting')}
          </span>
        </>
      ) : (
        <>
          <Sparkles size={12} className="text-primary mt-0.5 shrink-0" />
          <span className="text-muted-foreground min-w-0 flex-1 text-xs break-words">
            {suggestion}
          </span>
        </>
      )}
    </div>
  )
}
