'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { useVocabDraft } from '~/hooks/use-vocab-draft'

import type { DraftVocabulary } from '~/types/vocab-draft'

export type { DraftStatus, DraftVocabulary } from '~/types/vocab-draft'

export type ImportStep = 'setup' | 'extracting' | 'editing'

interface UseImportFlowReturn {
  step: ImportStep
  imageFiles: File[]
  imagePreviews: string[]
  lessonId: string
  isNewLesson: boolean
  newLessonName: string
  vocabularies: DraftVocabulary[]
  isSaving: boolean
  isCheckingDuplicates: boolean
  addImages: (files: File[]) => void
  removeImage: (index: number) => void
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

export function useImportFlow(): UseImportFlowReturn {
  const [step, setStep] = useState<ImportStep>('setup')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const imagePreviewsRef = useRef<string[]>([])

  const vocabDraft = useVocabDraft()

  function addImages(files: File[]): void {
    const images = files.filter((file) => file.type.startsWith('image/'))
    if (images.length === 0) return

    setImageFiles((prev) => [...prev, ...images])
    setImagePreviews((prev) => {
      const next = [...prev, ...images.map((file) => URL.createObjectURL(file))]
      imagePreviewsRef.current = next
      return next
    })
  }

  function removeImage(index: number): void {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => {
      const removed = prev[index]
      if (removed) URL.revokeObjectURL(removed)
      const next = prev.filter((_, i) => i !== index)
      imagePreviewsRef.current = next
      return next
    })
  }

  async function extract(): Promise<void> {
    if (imageFiles.length === 0) return
    setStep('extracting')
    try {
      const form = new FormData()
      imageFiles.forEach((file) => form.append('images', file))
      const res = await fetch('/api/extract-vocabulary', {
        method: 'POST',
        body: form,
      })
      if (!res.ok) throw new Error('Extraction failed')
      const { vocabularies: items } = (await res.json()) as {
        vocabularies: Omit<DraftVocabulary, '_id' | 'status' | '_dbSnapshot'>[]
      }

      await vocabDraft.initialize(items)
      setStep('editing')
    } catch {
      toast.error('Đọc ảnh thất bại, thử lại')
      setStep('setup')
    }
  }

  async function confirm(): Promise<void> {
    const success = await vocabDraft.save()
    if (success) reset()
  }

  function reset(): void {
    setStep('setup')
    setImageFiles([])
    setImagePreviews((prev) => {
      prev.forEach((preview) => URL.revokeObjectURL(preview))
      imagePreviewsRef.current = []
      return []
    })
    vocabDraft.reset()
  }

  return {
    step,
    imageFiles,
    imagePreviews,
    vocabularies: vocabDraft.rows,
    lessonId: vocabDraft.lessonId,
    isNewLesson: vocabDraft.isNewLesson,
    newLessonName: vocabDraft.newLessonName,
    isSaving: vocabDraft.isSaving,
    isCheckingDuplicates: vocabDraft.isCheckingDuplicates,
    addImages,
    removeImage,
    setLessonId: vocabDraft.setLessonId,
    setIsNewLesson: vocabDraft.setIsNewLesson,
    setNewLessonName: vocabDraft.setNewLessonName,
    updateVocabulary: vocabDraft.update,
    deleteVocabulary: vocabDraft.remove,
    addVocabulary: vocabDraft.add,
    extract,
    confirm,
    reset,
  }
}
