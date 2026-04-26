'use client'

import { BookMarked, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  SelectValue,
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
import {
  useCreateVocabulary,
  useDeleteVocabulary,
  useUpdateVocabulary,
  useVocabularies,
} from '~/hooks/use-vocabularies'

import { VocabularyFormDialog } from './_components/vocabulary-form-dialog'

import type { Vocabulary } from '~/types'

const ALL = '__all__'

export default function VocabulariesPage() {
  const { data: lessons = [] } = useLessons()
  const [lessonFilter, setLessonFilter] = useState(ALL)
  const [wordFilter, setWordFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Vocabulary | null>(null)
  const [deletingVoca, setDeletingVoca] = useState<Vocabulary | null>(null)

  const lessonId = lessonFilter === ALL ? undefined : lessonFilter
  const { data: vocabularies = [], isLoading } = useVocabularies(lessonId)

  const createVocabulary = useCreateVocabulary()
  const updateVocabulary = useUpdateVocabulary()
  const deleteVocabulary = useDeleteVocabulary()

  const filtered = useMemo(
    () =>
      vocabularies.filter((v) =>
        v.word.toLowerCase().includes(wordFilter.toLowerCase()),
      ),
    [vocabularies, wordFilter],
  )

  const lessonName = (id: string) =>
    lessons.find((l) => l.id === id)?.name ?? id

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (voca: Vocabulary) => {
    setEditing(voca)
    setFormOpen(true)
  }

  const handleSubmit = async (data: {
    lesson_id: string
    word: string
    meaning: string
    example?: string
  }) => {
    if (editing) {
      await updateVocabulary.mutateAsync({
        id: editing.id,
        lessonId: editing.lesson_id,
        word: data.word,
        meaning: data.meaning,
        example: data.example,
      })
    } else {
      await createVocabulary.mutateAsync(data)
    }
    setFormOpen(false)
  }

  const isPending = createVocabulary.isPending || updateVocabulary.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vocabularies</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {vocabularies.length} word{vocabularies.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus />
          Add Vocabulary
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Select
          value={lessonFilter}
          onValueChange={(v) => v && setLessonFilter(v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All lessons" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All lessons</SelectItem>
            {lessons.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative max-w-xs flex-1">
          <Search
            size={14}
            className="text-muted-foreground absolute top-1/2 left-2.5 -translate-y-1/2"
          />
          <Input
            placeholder="Filter by word..."
            value={wordFilter}
            onChange={(e) => setWordFilter(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-xl border">
        {isLoading ? (
          <div className="text-muted-foreground flex items-center justify-center py-20 text-sm">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-20">
            <BookMarked size={36} className="opacity-30" />
            <p className="text-sm">
              {wordFilter
                ? 'No words match your filter'
                : 'No vocabularies yet — add one!'}
            </p>
          </div>
        ) : (
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
              {filtered.map((voca) => (
                <TableRow key={voca.id} className="group">
                  <TableCell className="px-5 font-medium">
                    {voca.word}
                  </TableCell>
                  <TableCell className="px-5">{voca.meaning}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate px-5">
                    {voca.example ?? (
                      <span className="italic opacity-40">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground px-5 text-sm">
                    {lessonName(voca.lesson_id)}
                  </TableCell>
                  <TableCell className="px-5">
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(voca)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingVoca(voca)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <VocabularyFormDialog
        key={`${formOpen}-${editing?.id ?? 'new'}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        lessons={lessons}
        isPending={isPending}
        onSubmit={handleSubmit}
      />

      <Dialog
        open={!!deletingVoca}
        onOpenChange={(open) => !open && setDeletingVoca(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vocabulary</DialogTitle>
            <DialogDescription>
              Delete &quot;{deletingVoca?.word}&quot;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingVoca(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteVocabulary.isPending}
              onClick={async () => {
                if (deletingVoca) {
                  await deleteVocabulary.mutateAsync({
                    id: deletingVoca.id,
                    lessonId: deletingVoca.lesson_id,
                  })
                  setDeletingVoca(null)
                }
              }}
            >
              {deleteVocabulary.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
