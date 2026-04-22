'use client'

import {
  ArrowDownAZ,
  ArrowUpAZ,
  BookOpen,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
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
import { Label } from '~/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Textarea } from '~/components/ui/textarea'
import {
  useCreateLesson,
  useDeleteLesson,
  useLessons,
  useUpdateLesson,
} from '~/hooks/use-lessons'

import type { Lesson } from '~/types'

type SortOrder = 'asc' | 'desc'

export default function LessonsPage() {
  const { data: lessons = [], isLoading } = useLessons()
  const createLesson = useCreateLesson()
  const updateLesson = useUpdateLesson()
  const deleteLesson = useDeleteLesson()

  const [filter, setFilter] = useState('')
  const [sort, setSort] = useState<SortOrder>('asc')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Lesson | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [nameError, setNameError] = useState('')

  const filtered = useMemo(
    () =>
      [...lessons]
        .filter((l) => l.name.toLowerCase().includes(filter.toLowerCase()))
        .sort((a, b) =>
          sort === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name),
        ),
    [lessons, filter, sort],
  )

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', description: '' })
    setNameError('')
    setFormOpen(true)
  }

  const openEdit = (lesson: Lesson) => {
    setEditing(lesson)
    setForm({ name: lesson.name, description: lesson.description ?? '' })
    setNameError('')
    setFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setNameError('Name is required')
      return
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    }
    if (editing) {
      await updateLesson.mutateAsync({ id: editing.id, ...payload })
    } else {
      await createLesson.mutateAsync(payload)
    }
    setFormOpen(false)
  }

  const isPending = createLesson.isPending || updateLesson.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lessons</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus />
          Add Lesson
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search
            size={14}
            className="text-muted-foreground absolute top-1/2 left-2.5 -translate-y-1/2"
          />
          <Input
            placeholder="Filter by name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setSort((s) => (s === 'asc' ? 'desc' : 'asc'))}
        >
          {sort === 'asc' ? <ArrowDownAZ size={15} /> : <ArrowUpAZ size={15} />}
          {sort === 'asc' ? 'A → Z' : 'Z → A'}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border">
        {isLoading ? (
          <div className="text-muted-foreground flex items-center justify-center py-20 text-sm">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-20">
            <BookOpen size={36} className="opacity-30" />
            <p className="text-sm">
              {filter
                ? 'No lessons match your filter'
                : 'No lessons yet — add one!'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-5">Name</TableHead>
                <TableHead className="px-5">Description</TableHead>
                <TableHead className="w-20 px-5" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lesson) => (
                <TableRow key={lesson.id} className="group">
                  <TableCell className="px-5 font-medium">
                    {lesson.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground px-5">
                    {lesson.description ?? (
                      <span className="italic opacity-40">No description</span>
                    )}
                  </TableCell>
                  <TableCell className="px-5">
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(lesson)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingId(lesson.id)}
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

      {/* Add / Edit Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => !open && setFormOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Lesson' : 'Add Lesson'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }))
                  if (nameError) setNameError('')
                }}
                placeholder="Enter lesson name"
                aria-invalid={!!nameError}
                autoFocus
              />
              {nameError && (
                <p className="text-destructive text-xs">{nameError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Enter description (optional)"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : editing ? 'Save Changes' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to delete this
              lesson?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteLesson.isPending}
              onClick={async () => {
                if (deletingId) {
                  await deleteLesson.mutateAsync(deletingId)
                  setDeletingId(null)
                }
              }}
            >
              {deleteLesson.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
