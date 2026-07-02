'use client'

import { Loader2, Volume2 } from 'lucide-react'
import { useState } from 'react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import {
  WordSaveAction,
  WordSaveFormDialog,
} from '~/components/word-save-action'
import { WordTypeBadge } from '~/components/word-type-badge'
import { useTTS } from '~/hooks/use-tts'
import { cn } from '~/lib/utils'
import { useWordLookup } from '~/lib/word-lookup-context'

interface WordInfoPopupProps {
  word: string
  children: React.ReactNode
}

export function WordInfoPopup({ word, children }: WordInfoPopupProps) {
  const tts = useTTS(word)
  const { detailMap, isLoading } = useWordLookup()
  const detail = detailMap.get(word.toLowerCase())
  const [isOpen, setIsOpen] = useState(false)
  const [isSaveFormOpen, setIsSaveFormOpen] = useState(false)

  function handleOpenChange(open: boolean): void {
    setIsOpen(open)
    if (!open) return
    tts.speak()
  }

  function handleOpenSaveForm(): void {
    setIsOpen(false)
    setIsSaveFormOpen(true)
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="inline border-0 bg-transparent p-0 font-[inherit] text-[inherit]"
            />
          }
        >
          {children}
        </PopoverTrigger>
        <PopoverContent
          className="w-72 p-3"
          style={{
            background: '#191a1b',
            borderColor: 'rgba(255,255,255,0.1)',
          }}
          side="top"
          align="start"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold text-[#f7f8f8]">
                  {word}
                </span>
                {detail?.wordType && <WordTypeBadge value={detail.wordType} />}
              </div>
              <button
                type="button"
                onClick={tts.speak}
                className={cn(
                  'shrink-0 rounded p-0.5 transition-colors',
                  tts.isSpeaking
                    ? 'text-[#7170ff]'
                    : 'text-[#8a8f98] hover:text-[#d0d6e0]',
                )}
              >
                {tts.isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Volume2 size={14} />
                )}
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-1.5">
                <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-full animate-pulse rounded bg-white/10" />
              </div>
            ) : (
              <>
                {detail?.ipa && (
                  <span className="font-mono text-xs text-[#7170ff]">
                    {detail.ipa}
                  </span>
                )}
                {detail?.meaning && (
                  <p className="text-sm text-[#d0d6e0]">{detail.meaning}</p>
                )}
                {detail?.description && (
                  <p className="text-xs text-[#8a8f98]">{detail.description}</p>
                )}
                {detail?.example && (
                  <p className="text-xs text-[#8a8f98] italic">
                    &ldquo;{detail.example}&rdquo;
                  </p>
                )}
                {detail?.synonyms && detail.synonyms.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {detail.synonyms.slice(0, 5).map((syn) => (
                      <span
                        key={syn}
                        className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-[#8a8f98]"
                      >
                        {syn}
                      </span>
                    ))}
                  </div>
                )}
                <WordSaveAction
                  word={word}
                  detail={detail}
                  onOpenForm={handleOpenSaveForm}
                />
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {isSaveFormOpen && (
        <WordSaveFormDialog
          word={word}
          detail={detail}
          onClose={() => setIsSaveFormOpen(false)}
        />
      )}
    </>
  )
}
