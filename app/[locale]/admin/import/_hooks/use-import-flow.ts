'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { useBulkCreateVocabularies } from '~/hooks/use-vocabularies'
import { lessonsService } from '~/services/lessons.service'
import { vocabulariesService } from '~/services/vocabularies.service'

// new | duplicate (same as DB) | modified (duplicate but user changed content)
export type DraftStatus = 'new' | 'duplicate' | 'modified'

export interface DraftVocabulary {
  _id: string
  _dbId?: string
  word: string
  word_type: string
  phonetic: string
  meaning: string
  example: string
  description: string
  // status is set after duplicate-check; undefined means not yet checked
  status?: DraftStatus
  // snapshot of original DB values (word_type/phonetic/meaning/example/description)
  _dbSnapshot?: Omit<
    DraftVocabulary,
    '_id' | '_dbId' | 'status' | '_dbSnapshot'
  >
}

export type ImportStep = 'setup' | 'extracting' | 'editing'

interface UseImportFlowReturn {
  step: ImportStep
  imageFile: File | null
  imagePreview: string | null
  lessonId: string
  isNewLesson: boolean
  newLessonName: string
  vocabularies: DraftVocabulary[]
  isSaving: boolean
  isCheckingDuplicates: boolean
  setImage: (file: File) => void
  setLessonId: (id: string) => void
  setIsNewLesson: (v: boolean) => void
  setNewLessonName: (name: string) => void
  updateVocabulary: (
    id: string,
    field: keyof DraftVocabulary,
    value: string,
  ) => void
  deleteVocabulary: (id: string) => void
  addVocabulary: () => void
  extract: () => Promise<void>
  confirm: () => Promise<void>
  reset: () => void
}

// Fields that matter for "is the content different from DB?"
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

export function useImportFlow(): UseImportFlowReturn {
  const [step, setStep] = useState<ImportStep>('setup')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [lessonId, setLessonId] = useState('')
  const [isNewLesson, setIsNewLesson] = useState(false)
  const [newLessonName, setNewLessonName] = useState('')
  const [vocabularies, setVocabularies] = useState<DraftVocabulary[]>([])
  const [isSavingLesson, setIsSavingLesson] = useState(false)
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false)

  const bulkCreate = useBulkCreateVocabularies()

  function setImage(file: File) {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function updateVocabulary(
    id: string,
    field: keyof DraftVocabulary,
    value: string,
  ) {
    setVocabularies((prev) =>
      prev.map((v) => {
        if (v._id !== id) return v
        const updated = { ...v, [field]: value }
        // Re-evaluate status only for duplicate rows when a content field changes
        if (updated.status === 'duplicate' || updated.status === 'modified') {
          updated.status = isDifferentFromDb(updated) ? 'modified' : 'duplicate'
        }
        return updated
      }),
    )
  }

  function deleteVocabulary(id: string) {
    setVocabularies((prev) => prev.filter((v) => v._id !== id))
  }

  function addVocabulary() {
    setVocabularies((prev) => [
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

  async function extract() {
    if (!imageFile) return
    setStep('extracting')
    try {
      const form = new FormData()
      form.append('image', imageFile)
      const res = await fetch('/api/extract-vocabulary', {
        method: 'POST',
        body: form,
      })
      if (!res.ok) throw new Error('Extraction failed')
      const { vocabularies: items } = (await res.json()) as {
        vocabularies: Omit<DraftVocabulary, '_id' | 'status' | '_dbSnapshot'>[]
      }

      const drafts: DraftVocabulary[] = items.map((v) => ({
        ...v,
        _id: crypto.randomUUID(),
        status: 'new' as DraftStatus,
      }))

      setVocabularies(drafts)
      setStep('editing')

      // Check duplicates in background after moving to editing step
      setIsCheckingDuplicates(true)
      try {
        const words = drafts.map((d) => d.word.trim()).filter(Boolean)
        const existing = await vocabulariesService.findByWords(words)

        if (existing.length > 0) {
          const dbKey = (word: string, wordType: string | null) =>
            `${word.trim().toLowerCase()}|${(wordType ?? '').trim().toLowerCase()}`
          const existingMap = new Map(
            existing.map((e) => [dbKey(e.word, e.word_type ?? null), e]),
          )
          setVocabularies((prev) =>
            prev.map((draft) => {
              const match = existingMap.get(dbKey(draft.word, draft.word_type))
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
              const autoStatus: DraftStatus = isDifferentFromDb(
                draftWithSnapshot,
              )
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
    } catch {
      toast.error('Đọc ảnh thất bại, thử lại')
      setStep('setup')
    }
  }

  async function confirm() {
    setIsSavingLesson(true)
    try {
      const targetLessonId = isNewLesson
        ? (await lessonsService.createAndReturn({ name: newLessonName.trim() }))
            .id
        : lessonId

      const toInsert = vocabularies.filter(
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

      const skipped = vocabularies.filter(
        (v) => v.word.trim() && v.status === 'duplicate',
      ).length

      toast.success(
        skipped > 0
          ? `Đã lưu ${savedCount} từ vựng — bỏ qua ${skipped} từ trùng`
          : `Đã lưu ${savedCount} từ vựng`,
      )
      reset()
    } finally {
      setIsSavingLesson(false)
    }
  }

  function reset() {
    setStep('setup')
    setImageFile(null)
    setImagePreview(null)
    setLessonId('')
    setIsNewLesson(false)
    setNewLessonName('')
    setVocabularies([])
  }

  return {
    step,
    imageFile,
    imagePreview,
    lessonId,
    isNewLesson,
    newLessonName,
    vocabularies,
    isSaving: isSavingLesson || bulkCreate.isPending,
    isCheckingDuplicates,
    setImage,
    setLessonId,
    setIsNewLesson,
    setNewLessonName,
    updateVocabulary,
    deleteVocabulary,
    addVocabulary,
    extract,
    confirm,
    reset,
  }
}
