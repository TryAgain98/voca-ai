'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'

import type { Vocabulary } from '~/types'

interface WordInfoPopupProps {
  word: string
  vocab: Vocabulary | null
  children: React.ReactNode
}

export function WordInfoPopup({ word, vocab, children }: WordInfoPopupProps) {
  return (
    <Popover>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent
        className="w-64 p-3"
        style={{
          background: '#191a1b',
          borderColor: 'rgba(255,255,255,0.1)',
        }}
        side="top"
        align="start"
      >
        <div className="flex flex-col gap-2">
          <span className="text-base font-semibold text-[#f7f8f8]">{word}</span>

          {vocab?.phonetic && (
            <span className="font-mono text-xs text-[#7170ff]">
              {vocab.phonetic}
            </span>
          )}

          {vocab?.meaning ? (
            <p className="text-sm text-[#d0d6e0]">{vocab.meaning}</p>
          ) : (
            <p className="text-xs text-[#8a8f98] italic">
              Chưa có trong từ vựng
            </p>
          )}

          {vocab?.example && (
            <p
              className="border-t pt-2 text-xs text-[#8a8f98] italic"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              {vocab.example}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
