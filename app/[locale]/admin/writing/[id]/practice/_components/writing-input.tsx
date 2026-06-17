'use client'

import { Loader2, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'

interface WritingInputProps {
  sentence: string
  keywords: string[]
  isSubmitting: boolean
  onChange: (value: string) => void
  onSubmit: () => void
}

export function WritingInput({
  sentence,
  keywords,
  isSubmitting,
  onChange,
  onSubmit,
}: WritingInputProps) {
  const t = useTranslations('Writing')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw) => (
          <span
            key={kw}
            className="border-border rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300"
          >
            {kw}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Textarea
          value={sentence}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('sentencePlaceholder')}
          className="min-h-[100px] resize-none text-base"
          disabled={isSubmitting}
        />
        <p className="text-muted-foreground text-xs">{t('sentenceHint')}</p>
      </div>

      <Button
        onClick={onSubmit}
        disabled={!sentence.trim() || isSubmitting}
        className="w-full gap-2"
      >
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Send size={15} />
        )}
        {isSubmitting ? t('scoring') : t('submit')}
      </Button>
    </div>
  )
}
