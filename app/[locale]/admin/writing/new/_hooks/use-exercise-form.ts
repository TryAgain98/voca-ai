'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  useCreateWritingExercise,
  useUploadWritingImage,
} from '~/hooks/use-writing-exercises'

type FormStep = 'compose' | 'generating'

export function useExerciseForm(userId: string) {
  const locale = useLocale()
  const router = useRouter()

  const [step, setStep] = useState<FormStep>('compose')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [generatedTitle, setGeneratedTitle] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadImage = useUploadWritingImage()
  const createExercise = useCreateWritingExercise()

  function handleImageChange(file: File | null): void {
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setGeneratedTitle('')
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

  async function generateTitle(imageUrl: string): Promise<string> {
    const res = await fetch('/api/writing-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, keywords }),
    })
    if (!res.ok) throw new Error('Title generation failed')
    const { title } = (await res.json()) as { title: string }
    return title
  }

  async function handleSubmit(): Promise<void> {
    if (!imageFile || keywords.length === 0) {
      toast.error('Cần có ảnh và ít nhất 1 từ khoá')
      return
    }

    setStep('generating')

    try {
      const imageUrl = await uploadImage.mutateAsync({
        file: imageFile,
        userId,
      })
      const title = await generateTitle(imageUrl)
      setGeneratedTitle(title)

      await createExercise.mutateAsync({
        created_by: userId,
        title,
        image_url: imageUrl,
        keywords,
      })

      toast.success('Đã tạo bài viết thành công')
      router.push(`/${locale}/admin/writing`)
    } catch {
      toast.error('Không thể tạo bài viết, thử lại sau')
      setStep('compose')
    }
  }

  return {
    step,
    imageFile,
    imagePreview,
    keywords,
    keywordInput,
    generatedTitle,
    isSaving: step === 'generating',
    fileInputRef,
    setKeywordInput,
    handleImageChange,
    addKeyword,
    removeKeyword,
    handleSubmit,
  }
}
