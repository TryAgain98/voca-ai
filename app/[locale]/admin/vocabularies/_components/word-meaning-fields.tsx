'use client'

import { useTranslations } from 'next-intl'

import { SuggestionHint } from '~/app/[locale]/admin/vocabularies/_components/suggestion-hint'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

import type { UseSuggestionReturn } from '~/app/[locale]/admin/vocabularies/_hooks/use-translation-suggestion'

interface FieldConfig {
  value: string
  error?: string
  suggestion: UseSuggestionReturn
  onChange: (v: string) => void
  onApply: (v: string) => void
}

interface WordMeaningFieldsProps {
  wordConfig: FieldConfig
  meaningConfig: FieldConfig
}

export function WordMeaningFields({
  wordConfig,
  meaningConfig,
}: WordMeaningFieldsProps) {
  const t = useTranslations('Vocabularies')

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="word">
          {t('wordLabel')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="word"
          value={wordConfig.value}
          onChange={(e) => wordConfig.onChange(e.target.value)}
          placeholder='e.g. "render"'
          aria-invalid={!!wordConfig.error}
          autoFocus
        />
        <SuggestionHint
          suggestion={wordConfig.suggestion.suggestion}
          isLoading={wordConfig.suggestion.isLoading}
          onApply={wordConfig.onApply}
        />
        {wordConfig.error && (
          <p className="text-destructive text-xs">{wordConfig.error}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="meaning">
          {t('meaningLabel')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="meaning"
          value={meaningConfig.value}
          onChange={(e) => meaningConfig.onChange(e.target.value)}
          placeholder='e.g. "kết xuất giao diện"'
          aria-invalid={!!meaningConfig.error}
        />
        <SuggestionHint
          suggestion={meaningConfig.suggestion.suggestion}
          isLoading={meaningConfig.suggestion.isLoading}
          onApply={meaningConfig.onApply}
        />
        {meaningConfig.error && (
          <p className="text-destructive text-xs">{meaningConfig.error}</p>
        )}
      </div>
    </>
  )
}
