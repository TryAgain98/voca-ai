'use client'

import { BookPlus, Loader2, PlusCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { VocabDraftDuplicateNotice } from '~/components/vocab-draft-duplicate-notice'
import { VocabDraftTable } from '~/components/vocab-draft-table'
import { useVocabDraft } from '~/hooks/use-vocab-draft'
import { LessonSelector } from '~admin/import/_components/lesson-selector'

import type { SuggestedPassageVocab } from '~/providers/ai/types'

interface PassageVocabModalProps {
  vocabs: SuggestedPassageVocab[]
}

export function PassageVocabModal({
  vocabs,
}: PassageVocabModalProps): React.ReactNode {
  const t = useTranslations('Passages')
  const tImport = useTranslations('Import')
  const tCommon = useTranslations('Common')

  const [open, setOpen] = useState(false)
  const draft = useVocabDraft()

  function handleOpen(): void {
    draft.reset()
    void draft.initialize(vocabs)
    setOpen(true)
  }

  async function handleSave(): Promise<void> {
    const ok = await draft.save()
    if (ok) setOpen(false)
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        onClick={handleOpen}
        disabled={vocabs.length === 0}
      >
        <BookPlus size={15} />
        {t('addVocabFromPassage')}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[92vh] w-[96vw] max-w-7xl flex-col gap-0 overflow-hidden p-0 sm:max-w-7xl">
          <DialogHeader
            className="shrink-0 border-b px-6 py-4"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center justify-between pr-6">
              <DialogTitle>{t('addVocabFromPassage')}</DialogTitle>
              <div className="flex items-center gap-3">
                {draft.isCheckingDuplicates && (
                  <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <Loader2 size={12} className="animate-spin" />
                    {tImport('checkingDuplicates')}
                  </span>
                )}
                {!draft.isCheckingDuplicates && draft.conflictCount > 0 && (
                  <span className="text-xs text-indigo-500">
                    {tImport('conflictStats', {
                      conflictCount: draft.conflictCount,
                    })}
                  </span>
                )}
                <span className="text-muted-foreground text-sm">
                  {tImport('wordCount', { count: draft.rows.length })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={draft.add}
                  className="gap-1.5"
                >
                  <PlusCircle size={14} />
                  {tImport('addRow')}
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
            <VocabDraftDuplicateNotice rows={draft.rows} />

            <VocabDraftTable
              rows={draft.rows}
              onUpdate={draft.update}
              onDelete={draft.remove}
              onResolveConflict={draft.resolveConflict}
            />
          </div>

          <div
            className="shrink-0 rounded-b-lg border-t px-6 py-4"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-72 shrink-0">
                <LessonSelector
                  lessonId={draft.lessonId}
                  isNewLesson={draft.isNewLesson}
                  newLessonName={draft.newLessonName}
                  onLessonChange={draft.setLessonId}
                  onToggleNewLesson={draft.setIsNewLesson}
                  onNewLessonNameChange={draft.setNewLessonName}
                  showLabel={false}
                />
              </div>
              <div className="flex-1" />
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={draft.isSaving}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={!draft.canSave || draft.isSaving}
                title={
                  !draft.canSave && draft.newCount === 0
                    ? tImport('noSavableWords')
                    : ''
                }
              >
                {draft.isSaving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    {tCommon('saving')}
                  </>
                ) : draft.newCount > 0 ? (
                  tImport('saveButton', { count: draft.newCount })
                ) : (
                  tImport('noNewWords')
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
