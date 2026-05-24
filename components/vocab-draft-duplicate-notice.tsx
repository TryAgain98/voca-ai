'use client'

import { useTranslations } from 'next-intl'

import type { DraftVocabulary } from '~/types/vocab-draft'

interface VocabDraftDuplicateNoticeProps {
  rows: DraftVocabulary[]
}

export function VocabDraftDuplicateNotice({
  rows,
}: VocabDraftDuplicateNoticeProps): React.ReactNode {
  const t = useTranslations('Import')

  const duplicates = rows.filter(
    (v) => v.word.trim() && v.status === 'duplicate',
  )

  if (duplicates.length === 0) return null

  return (
    <p className="text-muted-foreground/70 text-xs">
      {t('duplicateNotice', { count: duplicates.length })}
      <span className="ml-1">
        {duplicates.map((v, i) => (
          <span key={v._id}>
            <span className="text-muted-foreground font-medium">{v.word}</span>
            {i < duplicates.length - 1 && <span className="mr-1">,</span>}
          </span>
        ))}
      </span>
    </p>
  )
}
