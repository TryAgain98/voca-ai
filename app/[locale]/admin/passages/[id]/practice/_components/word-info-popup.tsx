'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'

import type { Vocabulary, WordPos } from '~/types'

const POS_LABEL: Record<WordPos, string> = {
  n: 'noun',
  v: 'verb',
  adj: 'adjective',
  adv: 'adverb',
  prep: 'preposition',
  conj: 'conjunction',
  pron: 'pronoun',
  det: 'determiner',
  other: '',
}

interface WordInfoPopupProps {
  word: string
  pos: string
  vocab: Vocabulary | null
  children: React.ReactNode
}

export function WordInfoPopup({
  word,
  pos,
  vocab,
  children,
}: WordInfoPopupProps) {
  const posLabel = POS_LABEL[pos as WordPos] ?? pos

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
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-[#f7f8f8]">
              {word}
            </span>
            {posLabel && (
              <span className="text-xs text-[#8a8f98]">{posLabel}</span>
            )}
          </div>

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
