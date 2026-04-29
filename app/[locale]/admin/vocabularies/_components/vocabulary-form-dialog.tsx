'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { WordMeaningFields } from '~/app/[locale]/admin/vocabularies/_components/word-meaning-fields'
import { useVocabularySuggestions } from '~/app/[locale]/admin/vocabularies/_hooks/use-vocabulary-suggestions'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'

import type { Lesson, Vocabulary } from '~/types'

interface VocabularyFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Vocabulary | null
  lessons: Lesson[]
  isPending: boolean
  onSubmit: (data: {
    lesson_id: string
    word: string
    meaning: string
    example?: string
  }) => void
}

interface FormState {
  lesson_id: string
  word: string
  meaning: string
  example: string
}

type FieldError = Partial<Record<keyof FormState, string>>

export function VocabularyFormDialog({
  open,
  onOpenChange,
  editing,
  lessons,
  isPending,
  onSubmit,
}: VocabularyFormDialogProps) {
  const t = useTranslations('Vocabularies')
  const tCommon = useTranslations('Common')

  const [form, setForm] = useState<FormState>({
    lesson_id: editing?.lesson_id ?? '',
    word: editing?.word ?? '',
    meaning: editing?.meaning ?? '',
    example: editing?.example ?? '',
  })
  const [errors, setErrors] = useState<FieldError>({})

  const { wordToMeaning, meaningToWord } = useVocabularySuggestions(
    form.word,
    form.meaning,
  )

  const set = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const validate = (): boolean => {
    const next: FieldError = {}
    if (!form.lesson_id) next.lesson_id = t('lessonRequired')
    if (!form.word.trim()) next.word = t('wordRequired')
    if (!form.meaning.trim()) next.meaning = t('meaningRequired')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      lesson_id: form.lesson_id,
      word: form.word.trim(),
      meaning: form.meaning.trim(),
      example: form.example.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? t('editTitle') : t('addTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>
              {t('lessonLabel')} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.lesson_id}
              onValueChange={(v) => v && set('lesson_id', v)}
              disabled={!!editing}
            >
              <SelectTrigger aria-invalid={!!errors.lesson_id}>
                <span
                  className={`flex flex-1 truncate text-left text-sm${!form.lesson_id ? 'text-muted-foreground' : ''}`}
                >
                  {form.lesson_id
                    ? (lessons.find((l) => l.id === form.lesson_id)?.name ??
                      t('lessonPlaceholder'))
                    : t('lessonPlaceholder')}
                </span>
              </SelectTrigger>
              <SelectContent>
                {lessons.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.lesson_id && (
              <p className="text-destructive text-xs">{errors.lesson_id}</p>
            )}
          </div>

          <WordMeaningFields
            wordConfig={{
              value: form.word,
              error: errors.word,
              suggestion: meaningToWord,
              onChange: (v) => set('word', v),
              onApply: (v) => {
                set('word', v)
                meaningToWord.clear()
              },
            }}
            meaningConfig={{
              value: form.meaning,
              error: errors.meaning,
              suggestion: wordToMeaning,
              onChange: (v) => set('meaning', v),
              onApply: (v) => {
                set('meaning', v)
                wordToMeaning.clear()
              },
            }}
          />

          <div className="space-y-1.5">
            <Label htmlFor="example">{t('exampleLabel')}</Label>
            <Textarea
              id="example"
              value={form.example}
              onChange={(e) => set('example', e.target.value)}
              placeholder='e.g. "React renders UI to the DOM."'
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? tCommon('saving')
                : editing
                  ? tCommon('saveChanges')
                  : tCommon('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
