'use client'

import { Loader2, Plus, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef } from 'react'

import { ImageDropzone } from '~/app/[locale]/admin/writing/_components/image-dropzone'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

import type { KeyboardEvent } from 'react'

interface ExerciseComposeFormProps {
  imagePreview: string
  keywords: string[]
  keywordInput: string
  isSaving: boolean
  onImageChange: (file: File | null) => void
  onKeywordInputChange: (value: string) => void
  onAddKeyword: () => void
  onRemoveKeyword: (kw: string) => void
  onSubmit: () => void
}

export function ExerciseComposeForm({
  imagePreview,
  keywords,
  keywordInput,
  isSaving,
  onImageChange,
  onKeywordInputChange,
  onAddKeyword,
  onRemoveKeyword,
  onSubmit,
}: ExerciseComposeFormProps) {
  const t = useTranslations('Writing')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') {
      e.preventDefault()
      onAddKeyword()
    }
  }

  const isValid = !!imagePreview && keywords.length > 0

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <ImageDropzone
        imagePreview={imagePreview}
        onImageChange={onImageChange}
      />

      <div>
        <label className="text-foreground mb-2 block text-sm font-medium">
          {t('formKeywords')}
        </label>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={keywordInput}
            onChange={(e) => onKeywordInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('keywordPlaceholder')}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onAddKeyword}
            disabled={!keywordInput.trim()}
          >
            <Plus size={16} />
          </Button>
        </div>

        {keywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="border-border bg-muted text-foreground flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm"
              >
                {kw}
                <button
                  type="button"
                  onClick={() => onRemoveKeyword(kw)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-muted-foreground mt-1.5 text-xs">
          {t('keywordsHint')}
        </p>
      </div>

      <Button
        onClick={onSubmit}
        disabled={!isValid || isSaving}
        className="w-full"
      >
        {isSaving && <Loader2 size={16} className="mr-2 animate-spin" />}
        {isSaving ? t('saving') : t('createButton')}
      </Button>
    </div>
  )
}
