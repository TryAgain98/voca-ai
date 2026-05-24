'use client'

import { BookPlus, Loader2, PlusCircle, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '~/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { useLessons } from '~/hooks/use-lessons'
import { useBulkCreateVocabularies } from '~/hooks/use-vocabularies'
import { lessonsService } from '~/services/lessons.service'

import type { SuggestedPassageVocab } from '~/providers/ai/types'

interface DraftRow {
  _id: string
  word: string
  word_type: string
  phonetic: string
  meaning: string
  example: string
}

interface PassageVocabModalProps {
  vocabs: SuggestedPassageVocab[]
}

const COLUMNS: { key: keyof DraftRow; label: string; width: string }[] = [
  { key: 'word', label: 'Word', width: 'w-28' },
  { key: 'word_type', label: 'Type', width: 'w-16' },
  { key: 'phonetic', label: 'Phonetic', width: 'w-28' },
  { key: 'meaning', label: 'Meaning', width: 'w-36' },
  { key: 'example', label: 'Example', width: '' },
]

function toDraftRows(vocabs: SuggestedPassageVocab[]): DraftRow[] {
  return vocabs.map((v) => ({
    _id: crypto.randomUUID(),
    word: v.word,
    word_type: v.word_type,
    phonetic: v.phonetic,
    meaning: v.meaning,
    example: v.example,
  }))
}

export function PassageVocabModal({ vocabs }: PassageVocabModalProps) {
  const t = useTranslations('Passages')
  const tImport = useTranslations('Import')
  const tCommon = useTranslations('Common')
  const { data: lessons = [] } = useLessons()
  const bulkCreate = useBulkCreateVocabularies()

  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<DraftRow[]>([])
  const [lessonId, setLessonId] = useState('')
  const [isNewLesson, setIsNewLesson] = useState(false)
  const [newLessonName, setNewLessonName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function handleOpen() {
    setRows(toDraftRows(vocabs))
    setLessonId('')
    setIsNewLesson(false)
    setNewLessonName('')
    setOpen(true)
  }

  function updateRow(id: string, field: keyof DraftRow, value: string) {
    setRows((prev) =>
      prev.map((r) => (r._id === id ? { ...r, [field]: value } : r)),
    )
  }

  function deleteRow(id: string) {
    setRows((prev) => prev.filter((r) => r._id !== id))
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        _id: crypto.randomUUID(),
        word: '',
        word_type: '',
        phonetic: '',
        meaning: '',
        example: '',
      },
    ])
  }

  async function handleSave() {
    const toSave = rows.filter((r) => r.word.trim() && r.meaning.trim())
    if (!toSave.length) return
    setIsSaving(true)
    try {
      const targetLessonId = isNewLesson
        ? (await lessonsService.createAndReturn({ name: newLessonName.trim() }))
            .id
        : lessonId

      await bulkCreate.mutateAsync(
        toSave.map((r) => ({
          lesson_id: targetLessonId,
          word: r.word.trim(),
          meaning: r.meaning.trim(),
          word_type: r.word_type.trim() || undefined,
          phonetic: r.phonetic.trim() || undefined,
          example: r.example.trim() || undefined,
        })),
      )
      toast.success(`Đã lưu ${toSave.length} từ vựng`)
      setOpen(false)
    } catch {
      toast.error('Không thể lưu từ vựng')
    } finally {
      setIsSaving(false)
    }
  }

  const hasLesson = isNewLesson ? !!newLessonName.trim() : !!lessonId
  const canSave =
    rows.some((r) => r.word.trim() && r.meaning.trim()) && hasLesson

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
        <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col gap-0 p-0">
          <DialogHeader
            className="border-b px-6 py-4"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <DialogTitle>{t('addVocabFromPassage')}</DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                {tImport('wordCount', { count: rows.length })}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={addRow}
                className="gap-1.5"
              >
                <PlusCircle size={14} />
                {tImport('addRow')}
              </Button>
            </div>

            <div className="border-border rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {COLUMNS.map((c) => (
                      <TableHead key={c.key} className={c.width}>
                        {c.label}
                      </TableHead>
                    ))}
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row._id}>
                      {COLUMNS.map((c) => (
                        <TableCell key={c.key} className="p-1">
                          <Input
                            value={row[c.key]}
                            onChange={(e) =>
                              updateRow(row._id, c.key, e.target.value)
                            }
                            className="focus:bg-background h-8 border-transparent bg-transparent px-2 focus:border-inherit"
                          />
                        </TableCell>
                      ))}
                      <TableCell className="p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive h-8 w-8"
                          onClick={() => deleteRow(row._id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter
            className="border-t px-6 py-4"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div className="flex w-full items-center gap-3">
              <div className="flex-1">
                {!isNewLesson ? (
                  <div className="flex gap-2">
                    <Select
                      value={lessonId}
                      onValueChange={(v) => v && setLessonId(v)}
                    >
                      <SelectTrigger className="flex-1 text-sm">
                        <span
                          className={lessonId ? '' : 'text-muted-foreground'}
                        >
                          {lessonId
                            ? (lessons.find((l) => l.id === lessonId)?.name ??
                              tImport('lessonPlaceholder'))
                            : tImport('lessonPlaceholder')}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {lessons.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsNewLesson(true)}
                    >
                      <PlusCircle size={16} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder={tImport('newLessonPlaceholder')}
                      value={newLessonName}
                      onChange={(e) => setNewLessonName(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newLessonName.trim())
                          setIsNewLesson(false)
                        if (e.key === 'Escape') setIsNewLesson(false)
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setIsNewLesson(false)}
                    >
                      OK
                    </Button>
                  </div>
                )}
              </div>
              <Button
                onClick={handleSave}
                disabled={!canSave || isSaving}
                className="shrink-0 gap-2"
              >
                {isSaving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : null}
                {isSaving
                  ? tCommon('saving')
                  : tImport('saveButton', {
                      count: rows.filter(
                        (r) => r.word.trim() && r.meaning.trim(),
                      ).length,
                    })}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
