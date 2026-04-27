'use client'

import { Loader2, PlusCircle, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

import type { DraftStatus, DraftVocabulary } from '../_hooks/use-import-flow'

interface VocabularyEditorProps {
  vocabularies: DraftVocabulary[]
  isSaving: boolean
  isCheckingDuplicates: boolean
  onUpdate: (id: string, field: keyof DraftVocabulary, value: string) => void
  onDelete: (id: string) => void
  onAdd: () => void
  onConfirm: () => void
  onBack: () => void
}

const COLUMN_FIELDS: { field: keyof DraftVocabulary; width: string }[] = [
  { field: 'word', width: 'w-28' },
  { field: 'word_type', width: 'w-16' },
  { field: 'phonetic', width: 'w-28' },
  { field: 'meaning', width: 'w-32' },
  { field: 'example', width: 'w-48' },
  { field: 'description', width: '' },
]

const EDITABLE_FIELDS = new Set<keyof DraftVocabulary>(
  COLUMN_FIELDS.map((c) => c.field),
)

function rowBg(status?: DraftStatus) {
  if (status === 'duplicate') return 'bg-muted/40 opacity-60'
  if (status === 'modified') return 'bg-amber-50/40 dark:bg-amber-950/20'
  return ''
}

export function VocabularyEditor({
  vocabularies,
  isSaving,
  isCheckingDuplicates,
  onUpdate,
  onDelete,
  onAdd,
  onConfirm,
  onBack,
}: VocabularyEditorProps) {
  const t = useTranslations('Import')
  const tCommon = useTranslations('Common')

  const newCount = vocabularies.filter(
    (v) => v.word.trim() && v.status !== 'duplicate',
  ).length
  const dupCount = vocabularies.filter(
    (v) => v.word.trim() && v.status === 'duplicate',
  ).length
  const modCount = vocabularies.filter((v) => v.status === 'modified').length

  const colLabels: Record<string, string> = {
    word: t('colWord'),
    word_type: t('colType'),
    phonetic: t('colPhonetic'),
    meaning: t('colMeaning'),
    example: t('colExample'),
    description: t('colDescription'),
  }

  function StatusBadge({ status }: { status?: DraftStatus }) {
    if (!status || status === 'new') return null
    if (status === 'duplicate')
      return (
        <Badge
          variant="secondary"
          className="shrink-0 cursor-default text-[10px]"
          title={t('duplicateTitle')}
        >
          {t('duplicateBadge')}
        </Badge>
      )
    return (
      <Badge
        variant="outline"
        className="shrink-0 cursor-default border-amber-500 text-[10px] text-amber-600"
        title={t('modifiedTitle')}
      >
        {t('modifiedBadge')}
      </Badge>
    )
  }

  return (
    <div className="flex flex-col gap-4">
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

      <div className="border-border rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-6" />
              {COLUMN_FIELDS.map((c) => (
                <TableHead key={c.field} className={c.width}>
                  {colLabels[c.field]}
                </TableHead>
              ))}
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {vocabularies.map((v) => (
              <TableRow key={v._id} className={rowBg(v.status)}>
                <TableCell className="p-1">
                  <StatusBadge status={v.status} />
                </TableCell>

                {COLUMN_FIELDS.map((c) => (
                  <TableCell key={c.field} className="p-1">
                    <Input
                      value={String(v[c.field] ?? '')}
                      onChange={(e) => {
                        if (EDITABLE_FIELDS.has(c.field)) {
                          onUpdate(
                            v._id,
                            c.field as keyof DraftVocabulary,
                            e.target.value,
                          )
                        }
                      }}
                      className="focus:bg-background h-8 border-transparent bg-transparent px-2 focus:border-inherit"
                    />
                  </TableCell>
                ))}

                <TableCell className="p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive h-8 w-8"
                    onClick={() => onDelete(v._id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onBack}>
          {tCommon('back')}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isSaving || newCount === 0}
          title={newCount === 0 ? t('noSavableWords') : ''}
        >
          {isSaving
            ? tCommon('saving')
            : newCount > 0
              ? t('saveButton', { count: newCount })
              : t('noNewWords')}
        </Button>
      </div>
    </div>
  )
}
