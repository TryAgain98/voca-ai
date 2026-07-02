'use client'

import { BookmarkPlus, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { VocabularyFormDialog } from '~/app/[locale]/admin/vocabularies/_components/vocabulary-form-dialog'
import { useLessons } from '~/hooks/use-lessons'
import { useCreateVocabulary } from '~/hooks/use-vocabularies'

import type { PassageWordDetail } from '~/lib/word-lookup-context'

const savedWords = new Set<string>()

export function isWordSaved(word: string, detail?: PassageWordDetail): boolean {
  return detail?.source === 'db' || savedWords.has(word.toLowerCase())
}

interface WordSaveActionProps {
  word: string
  detail: PassageWordDetail | undefined
  onOpenForm: () => void
}

export function WordSaveAction({
  word,
  detail,
  onOpenForm,
}: WordSaveActionProps) {
  const t = useTranslations('Vocabularies')

  if (isWordSaved(word, detail)) {
    return (
      <div className="flex items-center gap-1.5 border-t border-white/8 pt-2 text-xs text-emerald-400">
        <Check size={12} />
        {t('inVocab')}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onOpenForm}
      className="flex items-center gap-1.5 border-t border-white/8 pt-2 text-xs text-[#8a8f98] transition-colors hover:text-[#828fff]"
    >
      <BookmarkPlus size={12} />
      {t('addToVocab')}
    </button>
  )
}

interface WordSaveFormDialogProps {
  word: string
  detail: PassageWordDetail | undefined
  onClose: () => void
}

export function WordSaveFormDialog({
  word,
  detail,
  onClose,
}: WordSaveFormDialogProps) {
  const { data: lessons = [] } = useLessons()
  const createVocabulary = useCreateVocabulary()

  const handleSubmit = (payload: {
    lesson_id: string
    word: string
    word_type?: string
    meaning: string
    phonetic: string
    example?: string
    description?: string
  }): void => {
    createVocabulary.mutate(payload, {
      onSuccess: () => {
        savedWords.add(payload.word.toLowerCase())
        onClose()
      },
    })
  }

  return (
    <VocabularyFormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      editing={null}
      initialValues={{
        word,
        word_type: detail?.wordType ?? '',
        meaning: detail?.meaning ?? '',
        phonetic: detail?.ipa ?? '',
        example: detail?.example ?? '',
        description: detail?.description ?? '',
      }}
      lessons={lessons}
      isPending={createVocabulary.isPending}
      onSubmit={handleSubmit}
    />
  )
}
