'use client'

import { motion } from 'framer-motion'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

import type { DragEvent } from 'react'

interface ImageDropzoneProps {
  imagePreview: string
  onImageChange: (file: File | null) => void
}

export function ImageDropzone({
  imagePreview,
  onImageChange,
}: ImageDropzoneProps) {
  const t = useTranslations('Writing')
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleDrop(e: DragEvent<HTMLDivElement>): void {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) onImageChange(file)
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>): void {
    e.preventDefault()
    if (!e.currentTarget.contains(e.relatedTarget as Node | null))
      setIsDragging(false)
  }

  return (
    <div>
      <label className="text-foreground mb-2 block text-sm font-medium">
        {t('formImage')}
      </label>

      <div
        className={cn(
          'border-border/80 bg-background/80 hover:border-primary/60 relative flex h-56 w-full cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border border-dashed p-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm',
          isDragging && 'border-primary bg-primary/5 ring-primary/10 ring-4',
          imagePreview && 'cursor-default hover:translate-y-0',
        )}
        onClick={() => !imagePreview && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragEnter={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
      >
        {imagePreview ? (
          <>
            <div className="bg-muted/40 relative flex max-h-36 w-full items-center justify-center overflow-hidden rounded-lg">
              <Image
                src={imagePreview}
                alt="preview"
                width={900}
                height={400}
                unoptimized
                className="max-h-36 w-full object-contain"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onImageChange(null)}
            >
              <X size={14} />
              {t('removeImage')}
            </Button>
          </>
        ) : (
          <>
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-2xl"
            >
              <Upload size={26} />
            </motion.div>
            <p className="text-muted-foreground max-w-xs text-sm leading-6">
              {t('uploadHint')}
            </p>
            <p className="text-muted-foreground text-xs">
              {t('uploadFormats')}
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onImageChange(file)
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
