'use client'

import { Loader2, PlusCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Button } from '~/components/ui/button'
import { VocabDraftTable } from '~/components/vocab-draft-table'
import { cn } from '~/lib/utils'

import { LessonSelector } from './lesson-selector'

import type { DraftVocabulary } from '~/types/vocab-draft'

interface VocabularyEditorProps {
  vocabularies: DraftVocabulary[]
  isSaving: boolean
  isCheckingDuplicates: boolean
  lessonId: string
  isNewLesson: boolean
  newLessonName: string
  onLessonChange: (id: string) => void
  onToggleNewLesson: (v: boolean) => void
  onNewLessonNameChange: (name: string) => void
  onUpdate: (id: string, field: keyof DraftVocabulary, value: string) => void
  onDelete: (id: string) => void
  onAdd: () => void
  onConfirm: () => void
  onBack: () => void
}

export function VocabularyEditor({
  vocabularies,
  isSaving,
  isCheckingDuplicates,
  lessonId,
  isNewLesson,
  newLessonName,
  onLessonChange,
  onToggleNewLesson,
  onNewLessonNameChange,
  onUpdate,
  onDelete,
  onAdd,
  onConfirm,
  onBack,
}: VocabularyEditorProps) {
  const t = useTranslations('Import')
  const tCommon = useTranslations('Common')

  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const container = document.querySelector('main')
    if (!container) return
    function handleScroll() {
      setIsScrolled((container?.scrollTop ?? 0) > 10)
    }
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const hasLesson = isNewLesson ? !!newLessonName.trim() : !!lessonId

  const newCount = vocabularies.filter(
    (v) => v.word.trim() && v.status !== 'duplicate',
  ).length
  const dupCount = vocabularies.filter(
    (v) => v.word.trim() && v.status === 'duplicate',
  ).length
  const modCount = vocabularies.filter((v) => v.status === 'modified').length

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          'bg-background border-border sticky top-0 z-10 -mx-4 flex items-center gap-2 border-b px-4 py-3 transition-shadow sm:-mx-6 sm:px-6',
          isScrolled && 'shadow-[0_4px_16px_rgba(0,0,0,0.25)]',
        )}
      >
        <div
          aria-hidden
          className="bg-background absolute inset-x-0 -top-4 h-4 sm:-top-6 sm:h-6"
        />
        <Button variant="outline" onClick={onBack}>
          {tCommon('back')}
        </Button>
        <div className="flex-1" />
        <div className="w-72 shrink-0">
          <LessonSelector
            lessonId={lessonId}
            isNewLesson={isNewLesson}
            newLessonName={newLessonName}
            onLessonChange={onLessonChange}
            onToggleNewLesson={onToggleNewLesson}
            onNewLessonNameChange={onNewLessonNameChange}
            showLabel={false}
          />
        </div>
        <Button
          onClick={onConfirm}
          disabled={isSaving || newCount === 0 || !hasLesson}
          title={
            !hasLesson
              ? t('lessonPlaceholder')
              : newCount === 0
                ? t('noSavableWords')
                : ''
          }
        >
          {isSaving
            ? tCommon('saving')
            : newCount > 0
              ? t('saveButton', { count: newCount })
              : t('noNewWords')}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-sm">
            {t('wordCount', { count: vocabularies.length })}
          </p>
          {isCheckingDuplicates && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Loader2 size={12} className="animate-spin" />
              {t('checkingDuplicates')}
            </span>
          )}
          {!isCheckingDuplicates && dupCount > 0 && (
            <span className="text-muted-foreground text-xs">
              {t('duplicateStats', { dupCount, modCount, newCount })}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onAdd} className="gap-1">
          <PlusCircle size={14} />
          {t('addRow')}
        </Button>
      </div>

      <VocabDraftTable
        rows={vocabularies}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  )
}
