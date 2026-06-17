'use client'

import { useUser } from '@clerk/nextjs'
import { Loader2, Plus, RefreshCw, X } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useRef } from 'react'

import { ImageDropzone } from '~/app/[locale]/admin/writing/_components/image-dropzone'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { useWritingExercise } from '~/hooks/use-writing-exercises'

import { useEditFormState } from './_hooks/use-edit-form'

import type { KeyboardEvent } from 'react'
import type { WritingExercise } from '~/types'

interface EditFormProps {
  exercise: WritingExercise
  userId: string
}

function EditForm({ exercise, userId }: EditFormProps) {
  const t = useTranslations('Writing')
  const form = useEditFormState(exercise, userId)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') {
      e.preventDefault()
      form.addKeyword()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <ImageDropzone
        imagePreview={form.imagePreview}
        onImageChange={form.handleImageChange}
      />

      <div>
        <label className="text-foreground mb-2 block text-sm font-medium">
          {t('formKeywords')}
        </label>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={form.keywordInput}
            onChange={(e) => form.setKeywordInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('keywordPlaceholder')}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={form.addKeyword}
            disabled={!form.keywordInput.trim()}
          >
            <Plus size={16} />
          </Button>
        </div>

        {form.keywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {form.keywords.map((kw) => (
              <span
                key={kw}
                className="border-border bg-muted text-foreground flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm"
              >
                {kw}
                <button
                  type="button"
                  onClick={() => form.removeKeyword(kw)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="text-foreground mb-2 block text-sm font-medium">
          {t('formTitle')}
        </label>
        <div className="flex gap-2">
          <Input
            value={form.title}
            onChange={(e) => form.setTitle(e.target.value)}
            placeholder={t('titlePlaceholder')}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => form.regenerateTitle(form.imagePreview)}
            disabled={
              form.isRegenerating ||
              !form.imagePreview ||
              form.keywords.length === 0
            }
          >
            <RefreshCw
              size={15}
              className={form.isRegenerating ? 'animate-spin' : ''}
            />
          </Button>
        </div>
      </div>

      <Button
        onClick={form.handleSave}
        disabled={
          !form.imagePreview ||
          form.keywords.length === 0 ||
          !form.title ||
          form.isSaving
        }
        className="w-full"
      >
        {form.isSaving && <Loader2 size={16} className="mr-2 animate-spin" />}
        {form.isSaving ? t('saving') : t('saveButton')}
      </Button>
    </div>
  )
}

export default function EditWritingExercisePage() {
  const t = useTranslations('Writing')
  const params = useParams<{ id: string }>()
  const { user } = useUser()
  const { data: exercise, isLoading } = useWritingExercise(params.id)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('editTitle')}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t('editDescription')}
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-24">
          <Loader2 size={28} className="text-muted-foreground animate-spin" />
        </div>
      )}

      {exercise && (
        <EditForm
          key={exercise.id}
          exercise={exercise}
          userId={user?.id ?? ''}
        />
      )}
    </div>
  )
}
