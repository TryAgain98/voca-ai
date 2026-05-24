'use client'

import { useUser } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PassageEditStep } from './_components/passage-edit-step'
import { PassageSetupStep } from './_components/passage-setup-step'
import { usePassageCreateFlow } from './_hooks/use-passage-create-flow'

export default function NewPassagePage() {
  const t = useTranslations('Passages')
  const { user } = useUser()
  const flow = usePassageCreateFlow(user?.id ?? '')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('setupTitle')}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t('setupDescription')}
        </p>
      </div>

      {flow.step === 'analyzing' && (
        <div className="flex flex-col items-center gap-3 py-24">
          <Loader2 size={32} className="text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">{t('analyzing')}</p>
        </div>
      )}

      {flow.step === 'setup' && (
        <PassageSetupStep
          tab={flow.tab}
          text={flow.text}
          imagePreview={flow.imagePreview}
          onTabChange={flow.setTab}
          onTextChange={flow.setText}
          onImageChange={flow.setImage}
          onAnalyze={flow.analyze}
        />
      )}

      {flow.step === 'editing' && (
        <PassageEditStep
          title={flow.editableTitle}
          translation={flow.editableTranslation}
          timeGood={flow.editableTimeGood}
          timeOk={flow.editableTimeOk}
          timeAcceptable={flow.editableTimeAcceptable}
          suggestedVocabs={flow.suggestedVocabs}
          isSaving={flow.isSaving}
          onTitleChange={flow.setEditableTitle}
          onTranslationChange={flow.setEditableTranslation}
          onTimeGoodChange={flow.setEditableTimeGood}
          onTimeOkChange={flow.setEditableTimeOk}
          onTimeAcceptableChange={flow.setEditableTimeAcceptable}
          onSave={flow.save}
          onBack={flow.reset}
        />
      )}
    </div>
  )
}
