'use client'

import { useUser } from '@clerk/nextjs'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { Button } from '~/components/ui/button'
import { useLessons } from '~/hooks/use-lessons'
import {
  useCreateVocabulary,
  useDeleteVocabulary,
  useUpdateVocabulary,
} from '~/hooks/use-vocabularies'
import { useVocabulariesWithMastery } from '~/hooks/use-vocabularies-with-mastery'

import { VocabularyDeleteDialog } from './_components/vocabulary-delete-dialog'
import { VocabularyDetailSheet } from './_components/vocabulary-detail-sheet'
import { VocabularyFilter } from './_components/vocabulary-filter'
import { VocabularyFormDialog } from './_components/vocabulary-form-dialog'
import { VocabularyTable } from './_components/vocabulary-table'

import type { MasteryStatus, VocabWithMastery, Vocabulary } from '~/types'

const ALL = 'all'

export default function VocabulariesPage() {
  const t = useTranslations('Vocabularies')
  const { user } = useUser()
  const { data: lessons = [] } = useLessons()

  const [lessonFilter, setLessonFilter] = useState(ALL)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<MasteryStatus | 'all'>(ALL)
  const [sortByDue, setSortByDue] = useState<'asc' | 'desc' | null>(null)
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Vocabulary | null>(null)
  const [deletingVoca, setDeletingVoca] = useState<VocabWithMastery | null>(
    null,
  )
  const [viewingVoca, setViewingVoca] = useState<VocabWithMastery | null>(null)

  const lessonId = lessonFilter === ALL ? undefined : lessonFilter
  const { data: vocabularies, isLoading } = useVocabulariesWithMastery(
    user?.id ?? '',
    lessonId,
  )

  const createVocabulary = useCreateVocabulary()
  const updateVocabulary = useUpdateVocabulary()
  const deleteVocabulary = useDeleteVocabulary()

  const filtered = useMemo(() => {
    let result = vocabularies

    const q = searchQuery.toLowerCase().trim()
    if (q) {
      result = result.filter(
        (v) =>
          v.word.toLowerCase().includes(q) ||
          v.meaning.toLowerCase().includes(q),
      )
    }

    if (statusFilter !== ALL) {
      result = result.filter((v) => v.masteryStatus === statusFilter)
    }

    if (sortByDue) {
      const dir = sortByDue === 'asc' ? 1 : -1
      result = [...result].sort((a, b) => {
        const aDue = a.mastery?.due_at
        const bDue = b.mastery?.due_at
        if (!aDue && !bDue) return 0
        if (!aDue) return 1
        if (!bDue) return -1
        return (new Date(aDue).getTime() - new Date(bDue).getTime()) * dir
      })
    }

    return result
  }, [vocabularies, searchQuery, statusFilter, sortByDue])

  const isFiltering =
    lessonFilter !== ALL || searchQuery.trim() !== '' || statusFilter !== ALL

  const handleLessonChange = (value: string) => {
    setLessonFilter(value)
    setPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  const handleStatusChange = (value: MasteryStatus | 'all') => {
    setStatusFilter(value)
    setPage(1)
  }

  const handleClearFilters = () => {
    setLessonFilter(ALL)
    setSearchQuery('')
    setStatusFilter(ALL)
    setPage(1)
  }

  const handleSubmit = async (data: {
    lesson_id: string
    word: string
    word_type?: string
    meaning: string
    phonetic: string
    example?: string
  }) => {
    if (editing) {
      await updateVocabulary.mutateAsync({
        id: editing.id,
        lessonId: editing.lesson_id,
        word: data.word,
        word_type: data.word_type,
        meaning: data.meaning,
        example: data.example,
        phonetic: data.phonetic,
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
        statusFilter={statusFilter}
        onLessonChange={handleLessonChange}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onClearFilters={handleClearFilters}
      />

      <div className="rounded-xl border">
        <VocabularyTable
          vocabularies={filtered}
          lessons={lessons}
          searchQuery={searchQuery}
          isLoading={isLoading}
          isFiltering={isFiltering}
          sortByDue={sortByDue}
          page={page}
          onPageChange={setPage}
          onSortByDueChange={setSortByDue}
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
