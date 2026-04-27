'use client'

import { Eye, Pencil, BookMarked, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SpeakButton } from '~/components/layout/speak-button'
import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { dayjs } from '~/lib/dayjs'

import type { Lesson, Vocabulary } from '~/types'

interface VocabularyTableProps {
  vocabularies: Vocabulary[]
  lessons: Lesson[]
  searchQuery: string
  isLoading: boolean
  onView: (voca: Vocabulary) => void
  onEdit: (voca: Vocabulary) => void
  onDelete: (voca: Vocabulary) => void
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  const d = dayjs(iso)
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

export function VocabularyTable({
  vocabularies,
  lessons,
  searchQuery,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: VocabularyTableProps) {
  const t = useTranslations('Vocabularies')
  const tCommon = useTranslations('Common')

  const lessonName = (id: string) =>
    lessons.find((l) => l.id === id)?.name ?? id

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center justify-center py-20 text-sm">
        {tCommon('loading')}
      </div>
    )
  }

  if (vocabularies.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-20">
        <BookMarked size={36} className="opacity-30" />
        <p className="text-sm">
          {searchQuery ? t('emptyFiltered') : t('emptyAll')}
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-36 px-5">Từ</TableHead>
          <TableHead className="w-24 px-4">Phiên âm</TableHead>
          <TableHead className="w-12 px-2">Loại</TableHead>
          <TableHead className="px-4">Nghĩa</TableHead>
          <TableHead className="px-4">Bài học</TableHead>
          <TableHead className="w-28 px-4">Cập nhật</TableHead>
          <TableHead className="w-28 px-5" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {vocabularies.map((voca) => (
          <TableRow
            key={voca.id}
            className="group cursor-pointer"
            onClick={() => onView(voca)}
          >
            <TableCell className="px-5">
              <span className="font-semibold">
                {highlight(voca.word, searchQuery)}
              </span>
            </TableCell>

            <TableCell className="text-muted-foreground px-4 font-mono text-xs">
              {voca.phonetic ?? <span className="opacity-30">—</span>}
            </TableCell>

            <TableCell className="text-muted-foreground px-2 text-xs">
              {voca.word_type ?? <span className="opacity-30">—</span>}
            </TableCell>

            <TableCell className="max-w-xs px-4">
              <span className="line-clamp-2 text-sm">
                {highlight(voca.meaning, searchQuery)}
              </span>
            </TableCell>

            <TableCell className="text-muted-foreground px-4 text-sm">
              {lessonName(voca.lesson_id)}
            </TableCell>

            <TableCell className="text-muted-foreground px-4 text-xs whitespace-nowrap">
              {formatDate(voca.updated_at)}
            </TableCell>

            <TableCell className="px-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <SpeakButton text={voca.word} />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Xem chi tiết"
                  onClick={() => onView(voca)}
                >
                  <Eye size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Chỉnh sửa"
                  onClick={() => onEdit(voca)}
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  title="Xóa"
                  onClick={() => onDelete(voca)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
