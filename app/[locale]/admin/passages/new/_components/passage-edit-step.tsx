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
  title: string
  summary: string
  translation: string
  timeGood: number
  timeOk: number
  timeAcceptable: number
  suggestedVocabs: SuggestedPassageVocab[]
  isSaving: boolean
  onTitleChange: (v: string) => void
  onSummaryChange: (v: string) => void
  onTranslationChange: (v: string) => void
  onTimeGoodChange: (v: number) => void
  onTimeOkChange: (v: number) => void
  onTimeAcceptableChange: (v: number) => void
  onSave: () => void
  onBack: () => void
}

export function PassageEditStep({
  title,
  summary,
  translation,
  timeGood,
  timeOk,
  timeAcceptable,
  suggestedVocabs,
  isSaving,
  onTitleChange,
  onSummaryChange,
  onTranslationChange,
  onTimeGoodChange,
  onTimeOkChange,
  onTimeAcceptableChange,
  onSave,
  onBack,
}: PassageEditStepProps) {
  const t = useTranslations('Passages')

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div
        className="flex flex-col gap-4 rounded-xl border p-5"
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">{t('fieldTitle')}</Label>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">{t('fieldSummary')}</Label>
          <Textarea
            value={summary}
            onChange={(e) => onSummaryChange(e.target.value)}
            className="min-h-20 resize-none text-sm"
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
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-emerald-400">
                {t('timeGood')}
              </Label>
              <Input
                type="number"
                value={timeGood}
                onChange={(e) => onTimeGoodChange(Number(e.target.value))}
                className="text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-amber-400">{t('timeOk')}</Label>
              <Input
                type="number"
                value={timeOk}
                onChange={(e) => onTimeOkChange(Number(e.target.value))}
                className="text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-orange-400">
                {t('timeAcceptable')}
              </Label>
              <Input
                type="number"
                value={timeAcceptable}
                onChange={(e) => onTimeAcceptableChange(Number(e.target.value))}
                className="text-sm"
              />
            </div>
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
