'use client'

import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'

import type { ConflictAction, DraftVocabulary } from '~/types/vocab-draft'

interface VocabDraftConflictPanelProps {
  draft: DraftVocabulary
  onResolve: (id: string, action: ConflictAction) => void
}

export function VocabDraftConflictPanel({
  draft,
  onResolve,
}: VocabDraftConflictPanelProps): React.ReactNode {
  const t = useTranslations('Import')
  const { _dbConflicts = [], conflictAction, _id, meaning } = draft

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pb-1.5 pl-1">
      <span className="text-muted-foreground text-xs">
        {t('conflictAiMeaning')}
        <span className="text-foreground ml-1 font-medium">{meaning}</span>
      </span>

      {_dbConflicts.map((entry) => (
        <span key={entry.id} className="text-muted-foreground text-xs">
          {t('conflictExistingMeaning')}
          <span className="text-foreground ml-1 font-medium">
            {entry.meaning}
          </span>
        </span>
      ))}

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className={
            conflictAction === 'create_new'
              ? 'h-6 border-indigo-500 bg-indigo-500 px-2.5 text-xs text-white hover:bg-indigo-600 hover:text-white'
              : 'h-6 border-indigo-400/70 px-2.5 text-xs text-indigo-600 hover:border-indigo-500 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40'
          }
          onClick={() => onResolve(_id, 'create_new')}
        >
          {t('conflictActionCreateNew')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className={
            conflictAction === 'update_existing'
              ? 'h-6 border-amber-500 bg-amber-500 px-2.5 text-xs text-white hover:bg-amber-600 hover:text-white'
              : 'h-6 border-amber-400/70 px-2.5 text-xs text-amber-600 hover:border-amber-500 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40'
          }
          onClick={() => onResolve(_id, 'update_existing')}
        >
          {t('conflictActionUpdate')}
        </Button>
        {!conflictAction && (
          <span className="text-muted-foreground/60 text-xs">
            {t('conflictSkipHint')}
          </span>
        )}
      </div>
    </div>
  )
}
