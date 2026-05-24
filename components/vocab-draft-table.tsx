'use client'

import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Fragment } from 'react'

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
import { cn } from '~/lib/utils'

import { VocabDraftConflictPanel } from './vocab-draft-conflict-panel'

import type {
  ConflictAction,
  DraftStatus,
  DraftVocabulary,
} from '~/types/vocab-draft'

interface VocabDraftTableProps {
  rows: DraftVocabulary[]
  onUpdate: (id: string, field: keyof DraftVocabulary, value: string) => void
  onDelete: (id: string) => void
  onResolveConflict: (id: string, action: ConflictAction) => void
}

const COLUMN_FIELDS: { field: keyof DraftVocabulary; minWidth: string }[] = [
  { field: 'word', minWidth: 'min-w-[120px]' },
  { field: 'word_type', minWidth: 'min-w-[68px]' },
  { field: 'phonetic', minWidth: 'min-w-[128px]' },
  { field: 'meaning', minWidth: 'min-w-[128px]' },
  { field: 'example', minWidth: 'min-w-[200px]' },
  { field: 'description', minWidth: 'min-w-[200px]' },
]

const EDITABLE_FIELDS = new Set<keyof DraftVocabulary>(
  COLUMN_FIELDS.map((c) => c.field),
)

function rowBg(status?: DraftStatus): string {
  if (status === 'conflict') return 'bg-indigo-50/30 dark:bg-indigo-950/20'
  return ''
}

function StatusBadge({
  status,
  t,
}: {
  status?: DraftStatus
  t: ReturnType<typeof useTranslations>
}): React.ReactNode {
  if (!status || status === 'new') return null
  return (
    <Badge
      variant="outline"
      className="shrink-0 cursor-default border-indigo-500 text-[10px] text-indigo-600 dark:text-indigo-400"
      title={t('conflictTitle')}
    >
      {t('conflictBadge')}
    </Badge>
  )
}

export function VocabDraftTable({
  rows,
  onUpdate,
  onDelete,
  onResolveConflict,
}: VocabDraftTableProps): React.ReactNode {
  const t = useTranslations('Import')

  const colLabels: Record<string, string> = {
    word: t('colWord'),
    word_type: t('colType'),
    phonetic: t('colPhonetic'),
    meaning: t('colMeaning'),
    example: t('colExample'),
    description: t('colDescription'),
  }

  const visibleRows = rows.filter((v) => v.status !== 'duplicate')

  return (
    <div className="border-border rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-6" />
            {COLUMN_FIELDS.map((c) => (
              <TableHead key={String(c.field)} className={c.minWidth}>
                {colLabels[String(c.field)]}
              </TableHead>
            ))}
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleRows.map((v) => (
            <Fragment key={v._id}>
              <TableRow
                className={cn(
                  rowBg(v.status),
                  v.status === 'conflict' && 'border-b-0',
                )}
              >
                <TableCell className="p-1 align-top">
                  <StatusBadge status={v.status} t={t} />
                </TableCell>
                {COLUMN_FIELDS.map((c) => (
                  <TableCell key={String(c.field)} className="p-1 align-top">
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
                <TableCell className="p-1 align-top">
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
              {v.status === 'conflict' && (
                <TableRow
                  key={`${v._id}-conflict`}
                  className={cn(
                    rowBg('conflict'),
                    'border-t-0 hover:bg-transparent',
                  )}
                >
                  <TableCell
                    colSpan={COLUMN_FIELDS.length + 2}
                    className="px-1 pt-0 pb-1"
                  >
                    <VocabDraftConflictPanel
                      draft={v}
                      onResolve={onResolveConflict}
                    />
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
