'use client'

import { ArrowLeft, Loader2, Save, Timer } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'

import { PassageVocabModal } from './passage-vocab-modal'

import type { SuggestedPassageVocab } from '~/providers/ai/types'

interface PassageEditStepProps {
  passageContent: string
  title: string
  translation: string
  timeGood: number
  suggestedVocabs: SuggestedPassageVocab[]
  isSaving: boolean
  onTitleChange: (v: string) => void
  onTranslationChange: (v: string) => void
  onTimeGoodChange: (v: number) => void
  onSave: () => void
  onBack: () => void
}

export function PassageEditStep({
  passageContent,
  title,
  translation,
  timeGood,
  suggestedVocabs,
  isSaving,
  onTitleChange,
  onTranslationChange,
  onTimeGoodChange,
  onSave,
  onBack,
}: PassageEditStepProps) {
  const t = useTranslations('Passages')

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="bg-card flex flex-col gap-4 rounded-xl border p-5">
        {passageContent && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{t('fieldContent')}</Label>
            <div className="text-muted-foreground bg-muted min-h-24 rounded-md border px-3.5 py-3 font-mono text-sm leading-relaxed">
              {passageContent}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">{t('fieldTitle')}</Label>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">{t('fieldTranslation')}</Label>
          <Textarea
            value={translation}
            onChange={(e) => onTranslationChange(e.target.value)}
            className="min-h-32 resize-none text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Timer size={14} className="text-[#8a8f98]" />
            <Label className="text-xs">{t('timeBenchmarksLabel')}</Label>
          </div>
          <p className="text-muted-foreground text-xs">
            {t('timeBenchmarksHint')}
          </p>
          <div className="flex max-w-48 flex-col gap-1">
            <Label className="text-xs text-emerald-400">{t('timeGood')}</Label>
            <Input
              type="number"
              min={1}
              value={timeGood}
              onChange={(e) => onTimeGoodChange(Number(e.target.value))}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft size={16} />
          {t('backButton')}
        </Button>
        <PassageVocabModal vocabs={suggestedVocabs} />
        <Button
          onClick={onSave}
          disabled={!title.trim() || isSaving}
          className="flex-1 gap-2"
        >
          {isSaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {t('saveButton')}
        </Button>
      </div>
    </div>
  )
}
