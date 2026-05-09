'use client'

import { useTranslations } from 'next-intl'

import { SuggestionHint } from '~/app/[locale]/admin/vocabularies/_components/suggestion-hint'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'

import type { UseSuggestionReturn } from '~/app/[locale]/admin/vocabularies/_hooks/use-translation-suggestion'

interface ExampleFieldProps {
  value: string
  suggestion: UseSuggestionReturn
  onChange: (v: string) => void
}

export function ExampleField({
  value,
  suggestion,
  onChange,
}: ExampleFieldProps) {
  const t = useTranslations('Vocabularies')

  return (
    <div className="space-y-1.5">
      <Label htmlFor="example">{t('exampleLabel')}</Label>
      <Textarea
        id="example"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='e.g. "React renders UI to the DOM."'
        rows={2}
      />
      <SuggestionHint
        suggestion={suggestion.suggestion}
        isLoading={suggestion.isLoading}
      />
    </div>
  )
}
