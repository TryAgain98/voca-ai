'use client'

import { Loader2, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'

interface SuggestionHintProps {
  suggestion: string | null
  isLoading: boolean
  onApply: (value: string) => void
}

export function SuggestionHint({
  suggestion,
  isLoading,
  onApply,
}: SuggestionHintProps) {
  const t = useTranslations('Common')

  if (!isLoading && !suggestion) return null

  return (
    <div className="border-border bg-muted/40 flex items-center gap-2 rounded-md border border-dashed px-3 py-1.5">
      {isLoading ? (
        <>
          <Loader2
            size={12}
            className="text-muted-foreground shrink-0 animate-spin"
          />
          <span className="text-muted-foreground text-xs">
            {t('suggesting')}
          </span>
        </>
      ) : (
        <>
          <Sparkles size={12} className="text-primary shrink-0" />
          <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs">
            {suggestion}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 shrink-0 px-2 text-xs"
            onClick={() => onApply(suggestion!)}
          >
            {t('apply')}
          </Button>
        </>
      )}
    </div>
  )
}
