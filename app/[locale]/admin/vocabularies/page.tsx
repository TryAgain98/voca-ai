'use client'

import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { Button } from '~/components/ui/button'
import { useLessons } from '~/hooks/use-lessons'
import {
  useCreateVocabulary,
  useDeleteVocabulary,
  useUpdateVocabulary,
  useVocabularies,
} from '~/hooks/use-vocabularies'

import { VocabularyDeleteDialog } from './_components/vocabulary-delete-dialog'
import { VocabularyDetailSheet } from './_components/vocabulary-detail-sheet'
import { VocabularyFilter } from './_components/vocabulary-filter'
import { VocabularyFormDialog } from './_components/vocabulary-form-dialog'
import { VocabularyTable } from './_components/vocabulary-table'

import type { Vocabulary } from '~/types'

const ALL = 'all'

export default function VocabulariesPage() {
  const t = useTranslations('Vocabularies')
  const { data: lessons = [] } = useLessons()
  const [lessonFilter, setLessonFilter] = useState(ALL)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Vocabulary | null>(null)
  const [deletingVoca, setDeletingVoca] = useState<Vocabulary | null>(null)
  const [viewingVoca, setViewingVoca] = useState<Vocabulary | null>(null)

  const lessonId = lessonFilter === ALL ? undefined : lessonFilter
  const { data: vocabularies = [], isLoading } = useVocabularies(lessonId)

  const createVocabulary = useCreateVocabulary()
  const updateVocabulary = useUpdateVocabulary()
  const deleteVocabulary = useDeleteVocabulary()

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return vocabularies
    return vocabularies.filter(
      (v) =>
        v.word.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q),
    )
  }, [vocabularies, searchQuery])

  const isFiltering = lessonFilter !== ALL || searchQuery.trim() !== ''

  const handleLessonChange = (value: string) => {
    setLessonFilter(value)
    setPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  const handleClearFilters = () => {
    setLessonFilter(ALL)
    setSearchQuery('')
    setPage(1)
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

  const handleDelete = async () => {
    if (!deletingVoca) return
    await deleteVocabulary.mutateAsync({
      id: deletingVoca.id,
      lessonId: deletingVoca.lesson_id,
    })
    setDeletingVoca(null)
  }

  const isPending = createVocabulary.isPending || updateVocabulary.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {t('wordCount', { count: filtered.length })}
            {filtered.length !== vocabularies.length && (
              <span> / {t('wordCount', { count: vocabularies.length })}</span>
            )}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <Plus />
          {t('addButton')}
        </Button>
      </div>

      <VocabularyFilter
        lessons={lessons}
        lessonFilter={lessonFilter}
        searchQuery={searchQuery}
        onLessonChange={handleLessonChange}
        onSearchChange={handleSearchChange}
        onClearFilters={handleClearFilters}
      />

      <div className="rounded-xl border">
        <VocabularyTable
          vocabularies={filtered}
          lessons={lessons}
          searchQuery={searchQuery}
          isLoading={isLoading}
          isFiltering={isFiltering}
          page={page}
          onPageChange={setPage}
          onRowClick={setViewingVoca}
          onEdit={(v) => {
            setEditing(v)
            setFormOpen(true)
          }}
          onDelete={setDeletingVoca}
          onClearFilters={handleClearFilters}
        />
      </div>

      <VocabularyDetailSheet
        voca={viewingVoca}
        lessons={lessons}
        onClose={() => setViewingVoca(null)}
      />

      <VocabularyFormDialog
        key={`${formOpen}-${editing?.id ?? 'new'}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        lessons={lessons}
        isPending={isPending}
        onSubmit={handleSubmit}
      />

      <VocabularyDeleteDialog
        voca={deletingVoca}
        isPending={deleteVocabulary.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeletingVoca(null)}
      />
    </div>
  )
}
