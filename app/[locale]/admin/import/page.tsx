'use client'

import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SetupStep } from './_components/setup-step'
import { VocabularyEditor } from './_components/vocabulary-editor'
import { useImportFlow } from './_hooks/use-import-flow'

export default function ImportPage() {
  const t = useTranslations('Import')
  const flow = useImportFlow()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('description')}</p>
      </div>

      {flow.step === 'extracting' && (
        <div className="flex flex-col items-center gap-3 py-24">
          <Loader2 size={32} className="text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">{t('extracting')}</p>
        </div>
      )}

      {flow.step === 'setup' && (
        <SetupStep
          imagePreview={flow.imagePreview}
          lessonId={flow.lessonId}
          isNewLesson={flow.isNewLesson}
          newLessonName={flow.newLessonName}
          onImageChange={flow.setImage}
          onLessonChange={flow.setLessonId}
          onToggleNewLesson={flow.setIsNewLesson}
          onNewLessonNameChange={flow.setNewLessonName}
          onExtract={flow.extract}
        />
      )}

      {flow.step === 'editing' && (
        <VocabularyEditor
          vocabularies={flow.vocabularies}
          isSaving={flow.isSaving}
          isCheckingDuplicates={flow.isCheckingDuplicates}
          onUpdate={flow.updateVocabulary}
          onDelete={flow.deleteVocabulary}
          onAdd={flow.addVocabulary}
          onConfirm={flow.confirm}
          onBack={flow.reset}
        />
      )}
    </div>
  )
}
