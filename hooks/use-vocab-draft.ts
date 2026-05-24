'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { useBulkCreateVocabularies } from '~/hooks/use-vocabularies'
import { lessonsService } from '~/services/lessons.service'
import { vocabulariesService } from '~/services/vocabularies.service'

import type { DraftStatus, DraftVocabulary } from '~/types/vocab-draft'

type VocabInput = Omit<
  DraftVocabulary,
  '_id' | '_dbId' | 'status' | '_dbSnapshot'
>

const CONTENT_FIELDS = [
  'word_type',
  'phonetic',
  'meaning',
  'example',
  'description',
] as const

function isDifferentFromDb(draft: DraftVocabulary): boolean {
  if (!draft._dbSnapshot) return false
  return CONTENT_FIELDS.some(
    (f) => (draft[f] ?? '').trim() !== (draft._dbSnapshot![f] ?? '').trim(),
  )
}

export interface UseVocabDraftReturn {
  rows: DraftVocabulary[]
  lessonId: string
  isNewLesson: boolean
  newLessonName: string
  isSaving: boolean
  isCheckingDuplicates: boolean
  newCount: number
  dupCount: number
  modCount: number
  canSave: boolean
  setLessonId: (id: string) => void
  setIsNewLesson: (v: boolean) => void
  setNewLessonName: (name: string) => void
  initialize: (vocabs: VocabInput[]) => Promise<void>
  update: (id: string, field: keyof DraftVocabulary, value: string) => void
  remove: (id: string) => void
  add: () => void
  save: () => Promise<boolean>
  reset: () => void
}

export function useVocabDraft(): UseVocabDraftReturn {
  const [rows, setRows] = useState<DraftVocabulary[]>([])
  const [lessonId, setLessonId] = useState('')
  const [isNewLesson, setIsNewLesson] = useState(false)
  const [newLessonName, setNewLessonName] = useState('')
  const [isSavingState, setIsSavingState] = useState(false)
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false)

  const bulkCreate = useBulkCreateVocabularies()

  async function initialize(vocabs: VocabInput[]): Promise<void> {
    const drafts: DraftVocabulary[] = vocabs.map((v) => ({
      ...v,
      _id: crypto.randomUUID(),
      status: 'new' as DraftStatus,
    }))
    setRows(drafts)

    setIsCheckingDuplicates(true)
    try {
      const words = drafts.map((d) => d.word.trim()).filter(Boolean)
      const existing = await vocabulariesService.findByWords(words)

      if (existing.length > 0) {
        const dbKey = (
          word: string,
          wordType: string | null,
          meaning: string | null,
        ) =>
          `${word.trim().toLowerCase()}|${(wordType ?? '').trim().toLowerCase()}|${(meaning ?? '').trim().toLowerCase()}`

        const existingMap = new Map(
          existing.map((e) => [
            dbKey(e.word, e.word_type ?? null, e.meaning ?? null),
            e,
          ]),
        )

        setRows((prev) =>
          prev.map((draft) => {
            const match = existingMap.get(
              dbKey(draft.word, draft.word_type, draft.meaning),
            )
            if (!match) return draft
            const snapshot: Omit<
              DraftVocabulary,
              '_id' | '_dbId' | 'status' | '_dbSnapshot'
            > = {
              word: match.word,
              word_type: match.word_type ?? '',
              phonetic: match.phonetic ?? '',
              meaning: match.meaning,
              example: match.example ?? '',
              description: match.description ?? '',
            }
            const draftWithSnapshot = { ...draft, _dbSnapshot: snapshot }
            const autoStatus: DraftStatus = isDifferentFromDb(draftWithSnapshot)
              ? 'modified'
              : 'duplicate'
            return {
              ...draft,
              _dbId: match.id,
              status: autoStatus,
              _dbSnapshot: snapshot,
            }
          }),
        )
      }
    } finally {
      setIsCheckingDuplicates(false)
    }
  }

  function update(
    id: string,
    field: keyof DraftVocabulary,
    value: string,
  ): void {
    setRows((prev) =>
      prev.map((v) => {
        if (v._id !== id) return v
        const updated = { ...v, [field]: value }
        if (updated.status === 'duplicate' || updated.status === 'modified') {
          updated.status = isDifferentFromDb(updated) ? 'modified' : 'duplicate'
        }
        return updated
      }),
    )
  }

  function remove(id: string): void {
    setRows((prev) => prev.filter((v) => v._id !== id))
  }

  function add(): void {
    setRows((prev) => [
      ...prev,
      {
        _id: crypto.randomUUID(),
        word: '',
        word_type: '',
        phonetic: '',
        meaning: '',
        example: '',
        description: '',
        status: 'new',
      },
    ])
  }

  async function save(): Promise<boolean> {
    setIsSavingState(true)
    try {
      const targetLessonId = isNewLesson
        ? (await lessonsService.createAndReturn({ name: newLessonName.trim() }))
            .id
        : lessonId

      const toInsert = rows.filter(
        (v) => v.word.trim() && v.status !== 'duplicate',
      )
      const newWords = toInsert.filter((v) => v.status === 'new')
      const modifiedWords = toInsert.filter((v) => v.status === 'modified')

      let savedCount = 0

      if (newWords.length > 0) {
        await bulkCreate.mutateAsync(
          newWords.map((v) => ({
            lesson_id: targetLessonId,
            word: v.word.trim(),
            meaning: v.meaning.trim(),
            word_type: v.word_type.trim() || undefined,
            phonetic: v.phonetic.trim() || undefined,
            example: v.example.trim() || undefined,
            description: v.description.trim() || undefined,
          })),
        )
        savedCount += newWords.length
      }

      for (const v of modifiedWords) {
        if (!v._dbId) continue
        await vocabulariesService.update(v._dbId, {
          meaning: v.meaning.trim(),
          word_type: v.word_type.trim() || undefined,
          phonetic: v.phonetic.trim() || undefined,
          example: v.example.trim() || undefined,
          description: v.description.trim() || undefined,
        })
        savedCount++
      }

      const skipped = rows.filter(
        (v) => v.word.trim() && v.status === 'duplicate',
      ).length

      toast.success(
        skipped > 0
          ? `Đã lưu ${savedCount} từ vựng — bỏ qua ${skipped} từ trùng`
          : `Đã lưu ${savedCount} từ vựng`,
      )
      return true
    } catch {
      toast.error('Không thể lưu từ vựng')
      return false
    } finally {
      setIsSavingState(false)
    }
  }

  function reset(): void {
    setRows([])
    setLessonId('')
    setIsNewLesson(false)
    setNewLessonName('')
  }

  const newCount = rows.filter(
    (v) => v.word.trim() && v.status !== 'duplicate',
  ).length
  const dupCount = rows.filter(
    (v) => v.word.trim() && v.status === 'duplicate',
  ).length
  const modCount = rows.filter((v) => v.status === 'modified').length
  const hasLesson = isNewLesson ? !!newLessonName.trim() : !!lessonId

  return {
    rows,
    lessonId,
    isNewLesson,
    newLessonName,
    isSaving: isSavingState || bulkCreate.isPending,
    isCheckingDuplicates,
    newCount,
    dupCount,
    modCount,
    canSave: newCount > 0 && hasLesson,
    setLessonId,
    setIsNewLesson,
    setNewLessonName,
    initialize,
    update,
    remove,
    add,
    save,
    reset,
  }
}
