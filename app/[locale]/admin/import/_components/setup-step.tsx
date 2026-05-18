'use client'

import { ImageIcon, Images, Plus, PlusCircle, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '~/components/ui/select'
import { useLessons } from '~/hooks/use-lessons'
import { cn } from '~/lib/utils'

import type { DragEvent } from 'react'

interface SetupStepProps {
  imageFiles: File[]
  imagePreviews: string[]
  lessonId: string
  isNewLesson: boolean
  newLessonName: string
  onImagesAdd: (files: File[]) => void
  onImageRemove: (index: number) => void
  onLessonChange: (id: string) => void
  onToggleNewLesson: (v: boolean) => void
  onNewLessonNameChange: (name: string) => void
  onExtract: () => void
}

export function SetupStep({
  imageFiles,
  imagePreviews,
  lessonId,
  isNewLesson,
  newLessonName,
  onImagesAdd,
  onImageRemove,
  onLessonChange,
  onToggleNewLesson,
  onNewLessonNameChange,
  onExtract,
}: SetupStepProps) {
  const t = useTranslations('Import')
  const tCommon = useTranslations('Common')
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { data: lessons = [] } = useLessons()

  const canExtract =
    imageFiles.length > 0 && (isNewLesson ? newLessonName.trim() : lessonId)

  function handleFiles(files: FileList | File[]) {
    onImagesAdd(Array.from(files))
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div
        className={cn(
          'group border-border/80 bg-card hover:border-primary/50 hover:bg-muted/25 relative flex min-h-72 cursor-pointer flex-col gap-5 overflow-hidden rounded-xl border border-dashed p-4 shadow-sm transition-colors',
          isDragging && 'border-primary bg-primary/5 ring-primary/10 ring-4',
        )}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragEnter={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setIsDragging(false)
          }
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        {imagePreviews.length > 0 ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <Images size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium">{t('selectedImagesTitle')}</p>
                  <p className="text-muted-foreground truncate text-sm">
                    {t('dropzoneSelectedHint')}
                  </p>
                </div>
              </div>
              <div className="bg-muted text-muted-foreground shrink-0 rounded-full px-3 py-1 text-sm font-medium">
                {t('selectedImages', { count: imageFiles.length })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {imagePreviews.map((preview, index) => (
                <div
                  key={preview}
                  className="group/tile bg-muted relative aspect-[5/4] overflow-hidden rounded-lg border shadow-sm"
                >
                  <Image
                    src={preview}
                    alt={imageFiles[index]?.name ?? 'preview'}
                    fill
                    sizes="(min-width: 640px) 124px, 50vw"
                    unoptimized
                    className="object-cover"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/65 to-transparent" />
                  <p className="absolute inset-x-2 bottom-2 truncate text-xs font-medium text-white">
                    {imageFiles[index]?.name}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 size-7 border bg-white/90 text-slate-700 shadow-sm hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      onImageRemove(index)
                    }}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))}
              <div className="border-border text-muted-foreground hover:border-primary/50 hover:text-primary bg-background/60 flex aspect-[5/4] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm transition-colors">
                <Plus size={20} />
                <span>{t('addMoreImages')}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary flex size-16 items-center justify-center rounded-2xl transition-colors">
              <ImageIcon size={30} />
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium">{t('dropzoneTitle')}</p>
              <p className="text-muted-foreground text-sm">{t('dropzone')}</p>
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
            e.target.value = ''
          }}
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
                <span
                  className={`flex flex-1 truncate text-left text-sm${!lessonId ? 'text-muted-foreground' : ''}`}
                >
                  {lessonId
                    ? (lessons.find((l) => l.id === lessonId)?.name ??
                      t('lessonPlaceholder'))
                    : t('lessonPlaceholder')}
                </span>
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
