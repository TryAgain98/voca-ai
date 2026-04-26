'use client'

import { BookMarked, Pencil, Trash2 } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

import type { Lesson, Vocabulary } from '~/types'

interface VocabularyTableProps {
  vocabularies: Vocabulary[]
  lessons: Lesson[]
  wordFilter: string
  isLoading: boolean
  onEdit: (voca: Vocabulary) => void
  onDelete: (voca: Vocabulary) => void
}

export function VocabularyTable({
  vocabularies,
  lessons,
  wordFilter,
  isLoading,
  onEdit,
  onDelete,
}: VocabularyTableProps) {
  const lessonName = (id: string) =>
    lessons.find((l) => l.id === id)?.name ?? id

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center justify-center py-20 text-sm">
        Loading...
      </div>
    )
  }

  if (vocabularies.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-20">
        <BookMarked size={36} className="opacity-30" />
        <p className="text-sm">
          {wordFilter
            ? 'No words match your filter'
            : 'No vocabularies yet — add one!'}
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-5">Word</TableHead>
          <TableHead className="px-5">Meaning</TableHead>
          <TableHead className="px-5">Example</TableHead>
          <TableHead className="px-5">Lesson</TableHead>
          <TableHead className="w-20 px-5" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {vocabularies.map((voca) => (
          <TableRow key={voca.id} className="group">
            <TableCell className="px-5 font-medium">{voca.word}</TableCell>
            <TableCell className="px-5">{voca.meaning}</TableCell>
            <TableCell className="text-muted-foreground max-w-xs truncate px-5">
              {voca.example ?? <span className="italic opacity-40">—</span>}
            </TableCell>
            <TableCell className="text-muted-foreground px-5 text-sm">
              {lessonName(voca.lesson_id)}
            </TableCell>
            <TableCell className="px-5">
              <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEdit(voca)}
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
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
