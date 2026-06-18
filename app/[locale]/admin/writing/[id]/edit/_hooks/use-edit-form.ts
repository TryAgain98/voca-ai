'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  useUpdateWritingExercise,
  useUploadWritingImage,
} from '~/hooks/use-writing-exercises'

import type { WritingExercise } from '~/types'

export function useEditFormState(exercise: WritingExercise, userId: string) {
  const locale = useLocale()
  const router = useRouter()

  const updateExercise = useUpdateWritingExercise()
  const uploadImage = useUploadWritingImage()

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(exercise.image_url)
  const [keywords, setKeywords] = useState<string[]>(exercise.keywords)
  const [keywordInput, setKeywordInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function handleImageChange(file: File | null): void {
    if (!file) {
      setImageFile(null)
      setImagePreview('')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function addKeyword(): void {
    const trimmed = keywordInput.trim()
    if (!trimmed || keywords.includes(trimmed)) {
      setKeywordInput('')
      return
    }
    setKeywords((prev) => [...prev, trimmed])
    setKeywordInput('')
  }

  function removeKeyword(kw: string): void {
    setKeywords((prev) => prev.filter((k) => k !== kw))
  }

  async function handleSave(): Promise<void> {
    setIsSaving(true)
    try {
      let imageUrl = exercise.image_url
      if (imageFile) {
        imageUrl = await uploadImage.mutateAsync({ file: imageFile, userId })
      }

      await updateExercise.mutateAsync({
        id: exercise.id,
        payload: { title: keywords.join(' / '), image_url: imageUrl, keywords },
      })

      toast.success('Đã cập nhật bài viết')
      router.push(`/${locale}/admin/writing`)
    } catch {
      toast.error('Không thể cập nhật, thử lại sau')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    imagePreview,
    keywords,
    keywordInput,
    isSaving,
    setKeywordInput,
    handleImageChange,
    addKeyword,
    removeKeyword,
    handleSave,
  }
}
