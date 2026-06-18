'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  useCreateWritingExercise,
  useUploadWritingImage,
} from '~/hooks/use-writing-exercises'

export function useExerciseForm(userId: string) {
  const locale = useLocale()
  const router = useRouter()

  const [isSaving, setIsSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadImage = useUploadWritingImage()
  const createExercise = useCreateWritingExercise()

  function handleImageChange(file: File | null): void {
    if (!file) return
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

  async function handleSubmit(): Promise<void> {
    if (!imageFile || keywords.length === 0) {
      toast.error('Cần có ảnh và ít nhất 1 từ khoá')
      return
    }

    setIsSaving(true)

    try {
      const imageUrl = await uploadImage.mutateAsync({
        file: imageFile,
        userId,
      })

      await createExercise.mutateAsync({
        created_by: userId,
        title: keywords.join(' / '),
        image_url: imageUrl,
        keywords,
      })

      toast.success('Đã tạo bài viết thành công')
      router.push(`/${locale}/admin/writing`)
    } catch {
      toast.error('Không thể tạo bài viết, thử lại sau')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    imageFile,
    imagePreview,
    keywords,
    keywordInput,
    isSaving,
    fileInputRef,
    setKeywordInput,
    handleImageChange,
    addKeyword,
    removeKeyword,
    handleSubmit,
  }
}
