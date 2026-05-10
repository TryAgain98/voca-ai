'use client'

import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { ExampleField } from '~/app/[locale]/admin/vocabularies/_components/example-field'
import { IpaField } from '~/app/[locale]/admin/vocabularies/_components/ipa-field'
import { SuggestionHint } from '~/app/[locale]/admin/vocabularies/_components/suggestion-hint'
import { WordMeaningFields } from '~/app/[locale]/admin/vocabularies/_components/word-meaning-fields'
import { useVocabForm } from '~/app/[locale]/admin/vocabularies/_hooks/use-vocab-form'
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

import type { Lesson, Vocabulary } from '~/types'

const WORD_TYPES = [
  { value: 'n', label: 'Noun (n)' },
  { value: 'v', label: 'Verb (v)' },
  { value: 'adj', label: 'Adjective (adj)' },
  { value: 'adv', label: 'Adverb (adv)' },
  { value: 'prep', label: 'Preposition (prep)' },
  { value: 'phr.v', label: 'Phrasal Verb (phr.v)' },
  { value: 'p.p', label: 'Past Participle (p.p)' },
  { value: 'phrase', label: 'Phrase / Expression' },
] as const

interface VocabularyFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Vocabulary | null
  lessons: Lesson[]
  isPending: boolean
  onSubmit: (data: {
    lesson_id: string
    word: string
    word_type?: string
    meaning: string
    phonetic: string
    example?: string
  }) => void
}

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
  const {
    form,
    errors,
    canSubmit,
    hasAnySuggestion,
    suggestions,
    selectedLessonName,
    set,
    validate,
    applyAll,
  } = useVocabForm(editing, lessons)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      lesson_id: form.lesson_id,
      word: form.word.trim(),
      word_type: form.word_type.trim() || undefined,
      meaning: form.meaning.trim(),
      phonetic: form.phonetic.trim(),
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
              <SelectTrigger
                className="w-full"
                aria-invalid={!!errors.lesson_id}
              >
                <span
                  className={`min-w-0 flex-1 truncate text-left text-sm ${!form.lesson_id ? 'text-muted-foreground' : ''}`}
                >
                  {selectedLessonName ?? t('lessonPlaceholder')}
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

          <div className="space-y-1.5">
            <Label>{t('wordTypeLabel')}</Label>
            <Select
              value={form.word_type}
              onValueChange={(v) => set('word_type', v ?? '')}
            >
              <SelectTrigger className="w-full">
                <span
                  className={`min-w-0 flex-1 truncate text-left text-sm ${!form.word_type ? 'text-muted-foreground' : ''}`}
                >
                  {WORD_TYPES.find((t) => t.value === form.word_type)?.label ??
                    t('wordTypePlaceholder')}
                </span>
              </SelectTrigger>
              <SelectContent>
                {WORD_TYPES.map((wt) => (
                  <SelectItem key={wt.value} value={wt.value}>
                    {wt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <SuggestionHint
              suggestion={(() => {
                const s = suggestions.word_type.suggestion
                if (!s) return null
                return WORD_TYPES.find((wt) => wt.value === s)?.label ?? s
              })()}
              isLoading={suggestions.word_type.isLoading}
            />
          </div>

          <WordMeaningFields
            wordConfig={{
              value: form.word,
              error: errors.word,
              suggestion: suggestions.word,
              onChange: (v) => set('word', v),
            }}
            meaningConfig={{
              value: form.meaning,
              error: errors.meaning,
              suggestion: suggestions.meaning,
              onChange: (v) => set('meaning', v),
            }}
          />

          <IpaField
            value={form.phonetic}
            error={errors.phonetic}
            required
            suggestion={suggestions.phonetic}
            onChange={(v) => set('phonetic', v)}
          />

          <ExampleField
            value={form.example}
            suggestion={suggestions.example}
            onChange={(v) => set('example', v)}
          />

          {hasAnySuggestion && (
            <button
              type="button"
              onClick={applyAll}
              className="border-border bg-muted/40 hover:bg-muted/70 flex w-full items-center justify-center gap-2 rounded-md border border-dashed px-3 py-2 transition-colors"
            >
              <Sparkles size={13} className="text-primary shrink-0" />
              <span className="text-sm font-medium">{t('applyAll')}</span>
            </button>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isPending || !canSubmit}>
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
