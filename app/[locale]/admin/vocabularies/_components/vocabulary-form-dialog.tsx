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
import { Textarea } from '~/components/ui/textarea'

import type { VocabFormState } from '~/app/[locale]/admin/vocabularies/_hooks/use-vocab-form'
import type { Lesson, Vocabulary } from '~/types'

const WORD_TYPES = [
  { value: 'n', label: 'Noun (n)', desc: 'Danh từ — book, city, freedom' },
  { value: 'v', label: 'Verb (v)', desc: 'Động từ — run, display, achieve' },
  {
    value: 'adj',
    label: 'Adjective (adj)',
    desc: 'Tính từ — beautiful, fast, clear',
  },
  {
    value: 'adv',
    label: 'Adverb (adv)',
    desc: 'Trạng từ — quickly, very, already',
  },
  {
    value: 'prep',
    label: 'Preposition (prep)',
    desc: 'Giới từ đơn — in, on, at, by',
  },
  {
    value: 'prep phr.',
    label: 'Prepositional Phrase (prep phr.)',
    desc: 'Cụm giới từ — in front of, because of',
  },
  {
    value: 'phr.v',
    label: 'Phrasal Verb (phr.v)',
    desc: 'Động từ kép — give up, look after, put off',
  },
  {
    value: 'p.p',
    label: 'Past Participle (p.p)',
    desc: 'Quá khứ phân từ — broken, displayed, laid out',
  },
  {
    value: 'phrase',
    label: 'Phrase / Expression',
    desc: 'Cụm từ cố định — as soon as, by the way',
  },
] as const

interface VocabularyFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Vocabulary | null
  initialValues?: Partial<VocabFormState>
  lessons: Lesson[]
  isPending: boolean
  onSubmit: (data: {
    lesson_id: string
    word: string
    word_type?: string
    meaning: string
    phonetic: string
    example?: string
    description?: string
  }) => void
}

export function VocabularyFormDialog({
  open,
  onOpenChange,
  editing,
  initialValues,
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
  } = useVocabForm(editing, lessons, initialValues)

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
      description: form.description.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="flex max-h-[90dvh] w-full max-w-lg flex-col sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? t('editTitle') : t('addTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="[&::-webkit-scrollbar-thumb]:bg-border flex-1 space-y-4 overflow-y-auto px-0.5 pr-3 pb-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
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
                    {WORD_TYPES.find((t) => t.value === form.word_type)
                      ?.label ?? t('wordTypePlaceholder')}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {WORD_TYPES.map((wt) => (
                    <SelectItem key={wt.value} value={wt.value}>
                      <span className="flex flex-col gap-0.5">
                        <span>{wt.label}</span>
                        <span className="text-muted-foreground text-xs">
                          {wt.desc}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.word_type && !suggestions.word_type.suggestion && (
                <p className="text-muted-foreground text-xs">
                  {WORD_TYPES.find((wt) => wt.value === form.word_type)?.desc}
                </p>
              )}
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

            <div className="space-y-1.5">
              <Label htmlFor="description">{t('descriptionLabel')}</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                rows={2}
              />
              <SuggestionHint
                suggestion={suggestions.description.suggestion}
                isLoading={suggestions.description.isLoading}
              />
            </div>

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
          </div>

          <DialogFooter className="pt-4">
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
