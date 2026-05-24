'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { useBulkCreateVocabularies } from '~/hooks/use-vocabularies'
import { lessonsService } from '~/services/lessons.service'
import { vocabulariesService } from '~/services/vocabularies.service'

import type { ConflictAction, DraftVocabulary } from '~/types/vocab-draft'

type VocabInput = Omit<
  DraftVocabulary,
  '_id' | '_dbId' | 'status' | '_dbConflicts' | 'conflictAction'
>

const exactKey = (
  word: string,
  wordType: string | null,
  meaning: string | null,
): string =>
  `${word.trim().toLowerCase()}|${(wordType ?? '').trim().toLowerCase()}|${(meaning ?? '').trim().toLowerCase()}`

const wordTypeKey = (word: string, wordType: string | null): string =>
  `${word.trim().toLowerCase()}|${(wordType ?? '').trim().toLowerCase()}`

export interface UseVocabDraftReturn {
  rows: DraftVocabulary[]
  lessonId: string
  isNewLesson: boolean
  newLessonName: string
  isSaving: boolean
  isCheckingDuplicates: boolean
  newCount: number
  dupCount: number
  conflictCount: number
  canSave: boolean
  setLessonId: (id: string) => void
  setIsNewLesson: (v: boolean) => void
  setNewLessonName: (name: string) => void
  initialize: (vocabs: VocabInput[]) => Promise<void>
  update: (id: string, field: keyof DraftVocabulary, value: string) => void
  remove: (id: string) => void
  add: () => void
  resolveConflict: (id: string, action: ConflictAction) => void
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
      status: 'new',
    }))
    setRows(drafts)

    setIsCheckingDuplicates(true)
    try {
      const words = drafts.map((d) => d.word.trim()).filter(Boolean)
      const existing = await vocabulariesService.findByWords(words)

      if (existing.length === 0) return

      const exactMap = new Map(
        existing.map((e) => [
          exactKey(e.word, e.word_type ?? null, e.meaning ?? null),
          e,
        ]),
      )

      const wtGroupMap = new Map<string, typeof existing>()
      for (const e of existing) {
        const k = wordTypeKey(e.word, e.word_type ?? null)
        const group = wtGroupMap.get(k) ?? []
        group.push(e)
        wtGroupMap.set(k, group)
      }

      setRows((prev) =>
        prev.map((draft) => {
          if (
            exactMap.has(exactKey(draft.word, draft.word_type, draft.meaning))
          ) {
            return { ...draft, status: 'duplicate' }
          }

          const wtMatches =
            wtGroupMap.get(wordTypeKey(draft.word, draft.word_type)) ?? []
          if (wtMatches.length > 0) {
            return {
              ...draft,
              status: 'conflict',
              _dbConflicts: wtMatches.map((e) => ({
                id: e.id,
                meaning: e.meaning,
              })),
            }
          }

          return draft
        }),
      )
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
      prev.map((v) => (v._id === id ? { ...v, [field]: value } : v)),
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

  function resolveConflict(id: string, action: ConflictAction): void {
    setRows((prev) =>
      prev.map((v) => {
        if (v._id !== id) return v
        if (v.conflictAction === action) {
          return { ...v, conflictAction: undefined, _dbId: undefined }
        }
        const dbId =
          action === 'update_existing'
            ? (v._dbConflicts?.[0]?.id ?? undefined)
            : undefined
        return { ...v, conflictAction: action, _dbId: dbId }
      }),
    )
  }

  async function save(): Promise<boolean> {
    setIsSavingState(true)
    try {
      const targetLessonId = isNewLesson
        ? (await lessonsService.createAndReturn({ name: newLessonName.trim() }))
            .id
        : lessonId

      const newWords = rows.filter(
        (v) =>
          v.word.trim() &&
          (v.status === 'new' ||
            (v.status === 'conflict' && v.conflictAction === 'create_new')),
      )
      const toUpdate = rows.filter(
        (v) =>
          v.word.trim() &&
          v.status === 'conflict' &&
          v.conflictAction === 'update_existing' &&
          !!v._dbId,
      )

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

      for (const v of toUpdate) {
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
        (v) =>
          v.word.trim() &&
          (v.status === 'duplicate' ||
            (v.status === 'conflict' && !v.conflictAction)),
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

  const newCount = rows.filter((v) => {
    if (!v.word.trim()) return false
    if (v.status === 'new') return true
    if (v.status === 'conflict')
      return (
        v.conflictAction === 'create_new' ||
        v.conflictAction === 'update_existing'
      )
    return false
  }).length
  const dupCount = rows.filter(
    (v) => v.word.trim() && v.status === 'duplicate',
  ).length
  const conflictCount = rows.filter(
    (v) => v.word.trim() && v.status === 'conflict' && !v.conflictAction,
  ).length
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
    conflictCount,
    canSave: newCount > 0 && hasLesson,
    setLessonId,
    setIsNewLesson,
    setNewLessonName,
    initialize,
    update,
    remove,
    add,
    resolveConflict,
    save,
    reset,
  }
}
