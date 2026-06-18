'use client'

import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'

import { ExerciseComposeForm } from './_components/exercise-compose-form'
import { useExerciseForm } from './_hooks/use-exercise-form'

export default function NewWritingExercisePage() {
  const t = useTranslations('Writing')
  const { user } = useUser()
  const form = useExerciseForm(user?.id ?? '')

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('newTitle')}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t('newDescription')}
        </p>
      </div>

      <ExerciseComposeForm
        imagePreview={form.imagePreview}
        keywords={form.keywords}
        keywordInput={form.keywordInput}
        isSaving={form.isSaving}
        onImageChange={form.handleImageChange}
        onKeywordInputChange={form.setKeywordInput}
        onAddKeyword={form.addKeyword}
        onRemoveKeyword={form.removeKeyword}
        onSubmit={form.handleSubmit}
      />
    </div>
  )
}
