'use client'

import { ImageIcon, PlusCircle, Upload } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useRef } from 'react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { useLessons } from '~/hooks/use-lessons'

interface SetupStepProps {
  imagePreview: string | null
  lessonId: string
  isNewLesson: boolean
  newLessonName: string
  onImageChange: (file: File) => void
  onLessonChange: (id: string) => void
  onToggleNewLesson: (v: boolean) => void
  onNewLessonNameChange: (name: string) => void
  onExtract: () => void
}

export function SetupStep({
  imagePreview,
  lessonId,
  isNewLesson,
  newLessonName,
  onImageChange,
  onLessonChange,
  onToggleNewLesson,
  onNewLessonNameChange,
  onExtract,
}: SetupStepProps) {
  const t = useTranslations('Import')
  const tCommon = useTranslations('Common')
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: lessons = [] } = useLessons()

  const canExtract =
    imagePreview && (isNewLesson ? newLessonName.trim() : lessonId)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    onImageChange(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div
        className="border-border hover:border-primary/50 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {imagePreview ? (
          <Image
            src={imagePreview}
            alt="preview"
            width={600}
            height={256}
            unoptimized
            className="max-h-64 w-auto rounded object-contain"
          />
        ) : (
          <>
            <ImageIcon size={40} className="text-muted-foreground" />
            <p className="text-muted-foreground text-sm">{t('dropzone')}</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t('lessonLabel')}</Label>
        {!isNewLesson ? (
          <div className="flex gap-2">
            <Select
              value={lessonId}
              onValueChange={(v) => v && onLessonChange(v)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={t('lessonPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onToggleNewLesson(true)}
            >
              <PlusCircle size={16} />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder={t('newLessonPlaceholder')}
              value={newLessonName}
              onChange={(e) => onNewLessonNameChange(e.target.value)}
              autoFocus
            />
            <Button variant="outline" onClick={() => onToggleNewLesson(false)}>
              {tCommon('cancel')}
            </Button>
          </div>
        )}
      </div>

      <Button
        onClick={onExtract}
        disabled={!canExtract}
        className="w-full gap-2"
      >
        <Upload size={16} />
        {t('extractButton')}
      </Button>
    </div>
  )
}
