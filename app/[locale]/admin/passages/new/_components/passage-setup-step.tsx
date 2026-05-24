'use client'

import { ImageIcon, Sparkles, Type, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { cn } from '~/lib/utils'

import type { SetupTab } from '../_hooks/use-passage-create-flow'
import type { DragEvent } from 'react'

interface PassageSetupStepProps {
  tab: SetupTab
  text: string
  imagePreview: string | null
  onTabChange: (tab: SetupTab) => void
  onTextChange: (v: string) => void
  onImageChange: (file: File | null) => void
  onAnalyze: () => void
}

export function PassageSetupStep({
  tab,
  text,
  imagePreview,
  onTabChange,
  onTextChange,
  onImageChange,
  onAnalyze,
}: PassageSetupStepProps) {
  const t = useTranslations('Passages')
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const canAnalyze =
    (tab === 'text' && text.trim().length > 20) ||
    (tab === 'image' && imagePreview !== null)

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) onImageChange(file)
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div
        className="flex gap-1 rounded-lg border p-1"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        {(['text', 'image'] as SetupTab[]).map((t_) => (
          <button
            key={t_}
            onClick={() => onTabChange(t_)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors',
              tab === t_
                ? 'bg-[#5e6ad2] text-white'
                : 'text-[#8a8f98] hover:text-[#d0d6e0]',
            )}
          >
            {t_ === 'text' ? <Type size={14} /> : <ImageIcon size={14} />}
            {t_ === 'text' ? t('tabText') : t('tabImage')}
          </button>
        ))}
      </div>

      {tab === 'text' && (
        <Textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={t('textPlaceholder')}
          className="min-h-56 resize-none text-sm leading-relaxed"
        />
      )}

      {tab === 'image' && (
        <div
          className={cn(
            'border-border/80 bg-card hover:border-primary/50 relative flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border border-dashed p-6 transition-colors',
            isDragging && 'border-primary bg-primary/5 ring-primary/10 ring-4',
            imagePreview && 'cursor-default',
          )}
          onClick={() => !imagePreview && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragEnter={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            if (!e.currentTarget.contains(e.relatedTarget as Node | null))
              setIsDragging(false)
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          {imagePreview ? (
            <>
              <div className="relative max-h-72 w-full overflow-hidden rounded-lg">
                <Image
                  src={imagePreview}
                  alt="passage image"
                  width={600}
                  height={400}
                  unoptimized
                  className="h-auto w-full object-contain"
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
                {t('backButton')}
              </Button>
            </>
          ) : (
            <>
              <div className="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-2xl">
                <Upload size={28} />
              </div>
              <p className="text-muted-foreground text-sm">{t('imageHint')}</p>
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
      )}

      <Button
        onClick={onAnalyze}
        disabled={!canAnalyze}
        className="w-full gap-2"
      >
        <Sparkles size={16} />
        {t('analyzeButton')}
      </Button>
    </div>
  )
}
