'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { useTranslationSuggestion } from '~/app/[locale]/admin/vocabularies/_hooks/use-translation-suggestion'
import { useWordFill } from '~/app/[locale]/admin/vocabularies/_hooks/use-word-fill'

import type { UseSuggestionReturn } from '~/app/[locale]/admin/vocabularies/_hooks/use-translation-suggestion'
import type { Lesson, Vocabulary } from '~/types'

interface FormState {
  lesson_id: string
  word: string
  word_type: string
  meaning: string
  example: string
  phonetic: string
}

type FieldError = Partial<Record<keyof FormState, string>>

export interface VocabFormSuggestions {
  word: UseSuggestionReturn
  word_type: UseSuggestionReturn
  meaning: UseSuggestionReturn
  phonetic: UseSuggestionReturn
  example: UseSuggestionReturn
}

export interface UseVocabFormReturn {
  form: FormState
  errors: FieldError
  canSubmit: boolean
  hasAnySuggestion: boolean
  suggestions: VocabFormSuggestions
  selectedLessonName: string | undefined
  set: (field: keyof FormState, value: string) => void
  validate: () => boolean
  applyAll: () => void
}

export function useVocabForm(
  editing: Vocabulary | null,
  lessons: Lesson[],
): UseVocabFormReturn {
  const t = useTranslations('Vocabularies')

  const [form, setForm] = useState<FormState>({
    lesson_id: editing?.lesson_id ?? '',
    word: editing?.word ?? '',
    word_type: editing?.word_type ?? '',
    meaning: editing?.meaning ?? '',
    example: editing?.example ?? '',
    phonetic: editing?.phonetic ?? '',
  })
  const [errors, setErrors] = useState<FieldError>({})

  const wordFill = useWordFill(form.word)
  const meaningToWord = useTranslationSuggestion(
    form.meaning,
    'meaning-to-word',
    form.word.trim().length === 0,
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
    if (!form.phonetic.trim()) next.phonetic = t('phoneticRequired')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const canSubmit =
    !!form.lesson_id &&
    form.word.trim().length > 0 &&
    form.meaning.trim().length > 0 &&
    form.phonetic.trim().length > 0

  const { fill, clear: clearFill } = wordFill

  const suggestions: VocabFormSuggestions = {
    word: meaningToWord,
    word_type: {
      suggestion: form.word_type.trim() ? null : fill.word_type,
      isLoading: form.word_type.trim() ? false : fill.isLoading,
      clear: clearFill,
    },
    meaning: {
      suggestion: form.meaning.trim() ? null : fill.meaning,
      isLoading: form.meaning.trim() ? false : fill.isLoading,
      clear: clearFill,
    },
    phonetic: {
      suggestion: form.phonetic.trim() ? null : fill.phonetic,
      isLoading: form.phonetic.trim() ? false : fill.isLoading,
      clear: clearFill,
    },
    example: {
      suggestion: form.example.trim() ? null : fill.example,
      isLoading: form.example.trim() ? false : fill.isLoading,
      clear: clearFill,
    },
  }

  const hasAnySuggestion =
    !!suggestions.word.suggestion ||
    !!suggestions.word_type.suggestion ||
    !!suggestions.meaning.suggestion ||
    !!suggestions.phonetic.suggestion ||
    !!suggestions.example.suggestion

  const applyAll = () => {
    setForm((f) => ({
      ...f,
      word:
        !f.word.trim() && meaningToWord.suggestion
          ? meaningToWord.suggestion
          : f.word,
      word_type:
        !f.word_type.trim() && fill.word_type ? fill.word_type : f.word_type,
      meaning: !f.meaning.trim() && fill.meaning ? fill.meaning : f.meaning,
      phonetic:
        !f.phonetic.trim() && fill.phonetic ? fill.phonetic : f.phonetic,
      example: !f.example.trim() && fill.example ? fill.example : f.example,
    }))
    setErrors({})
    clearFill()
    meaningToWord.clear()
  }

  return {
    form,
    errors,
    canSubmit,
    hasAnySuggestion,
    suggestions,
    selectedLessonName: lessons.find((l) => l.id === form.lesson_id)?.name,
    set,
    validate,
    applyAll,
  }
}
