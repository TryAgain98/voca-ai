'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ImageIcon, Sparkles, Type, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

import { Button } from '~/components/ui/button'
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="mx-auto w-full max-w-4xl"
    >
      <div className="bg-card/95 ring-foreground/5 relative overflow-hidden rounded-2xl border p-3 shadow-sm ring-1 sm:p-5">
        <div className="from-primary to-accent absolute inset-x-0 top-0 h-1 bg-linear-to-r via-emerald-500" />

        <div className="flex min-w-0 flex-col gap-5">
          <div className="bg-muted/50 grid w-full grid-cols-2 gap-1.5 rounded-xl border p-1.5">
            {(['text', 'image'] as SetupTab[]).map((t_) => {
              const isActive = tab === t_

              return (
                <button
                  key={t_}
                  type="button"
                  onClick={() => onTabChange(t_)}
                  className={cn(
                    'relative flex h-11 min-w-0 items-center justify-center gap-2 overflow-hidden rounded-lg px-3 text-sm font-semibold transition-colors duration-200',
                    isActive
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:bg-background/70 hover:text-foreground',
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="passage-setup-active-tab"
                      className="bg-primary absolute inset-0 rounded-lg shadow-sm"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 34,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2 truncate">
                    {t_ === 'text' ? (
                      <Type size={15} />
                    ) : (
                      <ImageIcon size={15} />
                    )}
                    <span className="truncate">
                      {t_ === 'text' ? t('tabText') : t('tabImage')}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {tab === 'text' && (
              <motion.div
                key="text"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="min-w-0"
              >
                <textarea
                  data-slot="textarea"
                  value={text}
                  onChange={(e) => onTextChange(e.target.value)}
                  placeholder={t('textPlaceholder')}
                  className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/40 bg-background/80 [field-sizing:fixed] h-[22rem] max-h-[22rem] min-h-[22rem] w-full max-w-full min-w-0 resize-none overflow-y-auto rounded-xl border px-4 py-3 text-[15px] leading-7 shadow-inner shadow-black/[0.02] transition-[border-color,box-shadow,background-color] duration-200 outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </motion.div>
            )}

            {tab === 'image' && (
              <motion.div
                key="image"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className={cn(
                  'border-border/80 bg-background/80 hover:border-primary/60 relative flex h-[22rem] w-full max-w-full min-w-0 cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border border-dashed p-6 text-center transition-[border-color,box-shadow,background-color,transform] duration-200 hover:-translate-y-0.5 hover:shadow-sm',
                  isDragging &&
                    'border-primary bg-primary/5 ring-primary/10 ring-4',
                  imagePreview && 'cursor-default hover:translate-y-0',
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
                    <div className="bg-muted/40 relative flex max-h-72 w-full items-center justify-center overflow-hidden rounded-lg">
                      <Image
                        src={imagePreview}
                        alt="passage image"
                        width={900}
                        height={560}
                        unoptimized
                        className="max-h-72 w-full object-contain"
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
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-2xl"
                    >
                      <Upload size={28} />
                    </motion.div>
                    <p className="text-muted-foreground max-w-sm text-sm leading-6">
                      {t('imageHint')}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Button
        onClick={onAnalyze}
        disabled={!canAnalyze}
        className="mt-5 h-11 w-full gap-2 rounded-xl shadow-sm transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:shadow-md"
      >
        <Sparkles size={16} />
        {t('analyzeButton')}
      </Button>
    </motion.div>
  )
}
