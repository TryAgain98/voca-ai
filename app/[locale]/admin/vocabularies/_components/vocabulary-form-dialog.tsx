'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'

import { useTranslationSuggestion } from '../_hooks/use-translation-suggestion'

import { SuggestionHint } from './suggestion-hint'

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

  // Suggest meaning from word only when meaning field is empty
  const wordToMeaning = useTranslationSuggestion(
    form.word,
    'word-to-meaning',
    form.meaning.trim().length === 0,
  )

  // Suggest word from meaning only when word field is empty
  const meaningToWord = useTranslationSuggestion(
    form.meaning,
    'meaning-to-word',
    form.word.trim().length === 0,
  )

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

  const set = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const applyMeaning = (value: string) => {
    set('meaning', value)
    wordToMeaning.clear()
  }

  const applyWord = (value: string) => {
    set('word', value)
    meaningToWord.clear()
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
                <SelectValue placeholder={t('lessonPlaceholder')} />
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

          <div className="space-y-1.5">
            <Label htmlFor="word">
              {t('wordLabel')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="word"
              value={form.word}
              onChange={(e) => set('word', e.target.value)}
              placeholder='e.g. "render"'
              aria-invalid={!!errors.word}
              autoFocus
            />
            <SuggestionHint
              suggestion={meaningToWord.suggestion}
              isLoading={meaningToWord.isLoading}
              onApply={applyWord}
            />
            {errors.word && (
              <p className="text-destructive text-xs">{errors.word}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="meaning">
              {t('meaningLabel')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="meaning"
              value={form.meaning}
              onChange={(e) => set('meaning', e.target.value)}
              placeholder='e.g. "kết xuất giao diện"'
              aria-invalid={!!errors.meaning}
            />
            <SuggestionHint
              suggestion={wordToMeaning.suggestion}
              isLoading={wordToMeaning.isLoading}
              onApply={applyMeaning}
            />
            {errors.meaning && (
              <p className="text-destructive text-xs">{errors.meaning}</p>
            )}
          </div>

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
