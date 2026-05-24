'use client'

import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { useCreatePassage } from '~/hooks/use-passages'

import type {
  PassageAnalysis,
  SuggestedPassageVocab,
} from '~/providers/ai/types'

export type CreateStep = 'setup' | 'analyzing' | 'editing'
export type SetupTab = 'text' | 'image'

interface UsePassageCreateFlowReturn {
  step: CreateStep
  tab: SetupTab
  text: string
  imageFile: File | null
  imagePreview: string | null
  analysis: PassageAnalysis | null
  editableTitle: string
  editableTranslation: string
  editableTimeGood: number
  editableTimeOk: number
  editableTimeAcceptable: number
  suggestedVocabs: SuggestedPassageVocab[]
  isSaving: boolean
  setTab: (tab: SetupTab) => void
  setText: (v: string) => void
  setImage: (file: File | null) => void
  setEditableTitle: (v: string) => void
  setEditableTranslation: (v: string) => void
  setEditableTimeGood: (v: number) => void
  setEditableTimeOk: (v: number) => void
  setEditableTimeAcceptable: (v: number) => void
  analyze: () => Promise<void>
  save: () => Promise<void>
  reset: () => void
}

export function usePassageCreateFlow(
  userId: string,
): UsePassageCreateFlowReturn {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const [step, setStep] = useState<CreateStep>('setup')
  const [tab, setTab] = useState<SetupTab>('text')
  const [text, setText] = useState('')
  const [imageFile, setImageFileState] = useState<File | null>(null)
  const imagePreviewRef = useRef<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<PassageAnalysis | null>(null)
  const [editableTitle, setEditableTitle] = useState('')
  const [editableTranslation, setEditableTranslation] = useState('')
  const [editableTimeGood, setEditableTimeGood] = useState(0)
  const [editableTimeOk, setEditableTimeOk] = useState(0)
  const [editableTimeAcceptable, setEditableTimeAcceptable] = useState(0)
  const [suggestedVocabs, setSuggestedVocabs] = useState<
    SuggestedPassageVocab[]
  >([])
  const [isSaving, setIsSaving] = useState(false)

  const createPassage = useCreatePassage()

  function setImage(file: File | null) {
    if (imagePreviewRef.current) {
      URL.revokeObjectURL(imagePreviewRef.current)
      imagePreviewRef.current = null
    }
    setImageFileState(file)
    if (file) {
      const url = URL.createObjectURL(file)
      imagePreviewRef.current = url
      setImagePreview(url)
    } else {
      setImagePreview(null)
    }
  }

  async function analyze() {
    const canAnalyze =
      (tab === 'text' && text.trim().length > 20) ||
      (tab === 'image' && imageFile !== null)

    if (!canAnalyze) return

    setStep('analyzing')
    try {
      const form = new FormData()
      if (tab === 'text') {
        form.append('text', text.trim())
      } else {
        form.append('image', imageFile!)
      }

      const res = await fetch('/api/analyze-passage', {
        method: 'POST',
        body: form,
      })
      if (!res.ok) throw new Error('Analysis failed')
      const data = (await res.json()) as PassageAnalysis

      setAnalysis(data)
      setEditableTitle(data.title)
      setEditableTranslation(data.translation)
      setEditableTimeGood(data.time_good)
      setEditableTimeOk(data.time_ok)
      setEditableTimeAcceptable(data.time_acceptable)
      setSuggestedVocabs(data.suggested_vocabulary)
      setStep('editing')
    } catch {
      toast.error('Phân tích thất bại, thử lại')
      setStep('setup')
    }
  }

  async function save() {
    if (!analysis) return
    setIsSaving(true)
    try {
      const passage = await createPassage.mutateAsync({
        created_by: userId,
        title: editableTitle.trim(),
        content: analysis.content || text.trim(),
        translation: editableTranslation.trim() || null,
        time_good: editableTimeGood || null,
        time_ok: editableTimeOk || null,
        time_acceptable: editableTimeAcceptable || null,
      })

      toast.success('Đã lưu đoạn văn')
      router.push(`/${locale}/admin/passages/${passage.id}/practice`)
    } finally {
      setIsSaving(false)
    }
  }

  function reset() {
    setStep('setup')
    setText('')
    setImage(null)
    setAnalysis(null)
    setSuggestedVocabs([])
  }

  return {
    step,
    tab,
    text,
    imageFile,
    imagePreview,
    analysis,
    editableTitle,
    editableTranslation,
    editableTimeGood,
    editableTimeOk,
    editableTimeAcceptable,
    suggestedVocabs,
    isSaving,
    setTab,
    setText,
    setImage,
    setEditableTitle,
    setEditableTranslation,
    setEditableTimeGood,
    setEditableTimeOk,
    setEditableTimeAcceptable,
    analyze,
    save,
    reset,
  }
}
