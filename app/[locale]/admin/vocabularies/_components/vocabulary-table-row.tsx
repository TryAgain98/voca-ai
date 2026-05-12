'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SpeakButton } from '~/components/layout/speak-button'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { TableCell, TableRow } from '~/components/ui/table'
import { dayjs } from '~/lib/dayjs'

import { LevelDots } from './level-dots'

import type { MasteryStatus, VocabWithMastery } from '~/types'

const STATUS_STYLES: Record<
  MasteryStatus,
  { label: string; className: string }
> = {
  mastered: {
    label: 'statusMastered',
    className:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10',
  },
  practicing: {
    label: 'statusPracticing',
    className:
      'border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/10',
  },
  untested: {
    label: 'statusUntested',
    className:
      'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/5',
  },
}

function formatDue(dueAt: string | null | undefined): string {
  if (!dueAt) return '—'
  const d = dayjs(dueAt)
  if (!d.isValid()) return '—'
  return d.format('DD/MM/YYYY')
}

function highlight(text: string, query: string) {
  if (!query.trim()) return <>{text}</>
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi',
  )
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="rounded-sm bg-yellow-200/70 px-0.5 dark:bg-yellow-800/60"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

interface VocabularyTableRowProps {
  voca: VocabWithMastery
  rowNumber: number
  searchQuery: string
  lessonName: string
  showActions: boolean
  onRowClick: (voca: VocabWithMastery) => void
  onEdit?: (voca: VocabWithMastery) => void
  onDelete?: (voca: VocabWithMastery) => void
  renderRowActions?: (voca: VocabWithMastery) => React.ReactNode
}

export function VocabularyTableRow({
  voca,
  rowNumber,
  searchQuery,
  lessonName,
  showActions,
  onRowClick,
  onEdit,
  onDelete,
  renderRowActions,
}: VocabularyTableRowProps) {
  const t = useTranslations('Vocabularies')
  const tCommon = useTranslations('Common')
  const statusStyle = STATUS_STYLES[voca.masteryStatus]

  return (
    <TableRow className="cursor-pointer" onClick={() => onRowClick(voca)}>
      <TableCell className="text-muted-foreground px-4 text-center text-xs">
        {rowNumber}
      </TableCell>

      <TableCell className="px-5">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <SpeakButton text={voca.word} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold">
                {highlight(voca.word, searchQuery)}
              </span>
              {voca.word_type && (
                <Badge
                  variant="outline"
                  className="h-4 px-1.5 py-0 text-[10px] font-normal"
                >
                  {voca.word_type}
                </Badge>
              )}
            </div>
            {voca.phonetic && (
              <span className="text-muted-foreground font-mono text-xs">
                {voca.phonetic}
              </span>
            )}
          </div>
        </div>
      </TableCell>

      <TableCell className="max-w-xs px-4">
        <span className="line-clamp-2 text-sm">
          {highlight(voca.meaning, searchQuery)}
        </span>
      </TableCell>

      <TableCell className="text-muted-foreground px-4 text-sm">
        {lessonName}
      </TableCell>

      <TableCell className="px-4">
        <Badge
          variant="outline"
          className={`text-[11px] font-normal ${statusStyle.className}`}
        >
          {t(statusStyle.label as Parameters<typeof t>[0])}
        </Badge>
      </TableCell>

      <TableCell className="px-4">
        <LevelDots level={voca.mastery?.level ?? 0} />
      </TableCell>

      <TableCell className="text-muted-foreground px-4 text-xs whitespace-nowrap">
        {formatDue(voca.mastery?.due_at)}
      </TableCell>

      {showActions && (
        <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
          {renderRowActions ? (
            renderRowActions(voca)
          ) : (
            <div className="inline-flex cursor-pointer items-center rounded-md border border-white/8 bg-white/2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title={tCommon('edit')}
                  className="rounded-r-none"
                  onClick={() => onEdit(voca)}
                >
                  <Pencil size={13} />
                </Button>
              )}
              {onEdit && onDelete && <div className="h-4 w-px bg-white/8" />}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive rounded-l-none"
                  title={tCommon('delete')}
                  onClick={() => onDelete(voca)}
                >
                  <Trash2 size={13} />
                </Button>
              )}
            </div>
          )}
        </TableCell>
      )}
    </TableRow>
  )
}
