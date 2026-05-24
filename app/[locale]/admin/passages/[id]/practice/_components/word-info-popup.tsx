'use client'

import { Loader2, Volume2 } from 'lucide-react'
import { useState } from 'react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { useTTS } from '~/hooks/use-tts'
import { cn } from '~/lib/utils'

import { useWordLookup } from '../_utils/passage-lookup-context'

import type { WordDetailResponse } from '~/app/api/word-detail/route'

interface WordInfoPopupProps {
  word: string
  children: React.ReactNode
}

export function WordInfoPopup({ word, children }: WordInfoPopupProps) {
  const tts = useTTS(word)
  const { wordMap, isLoading: isAiLoading } = useWordLookup()
  const aiLookup = wordMap.get(word.toLowerCase())

  const [detail, setDetail] = useState<WordDetailResponse | null>(null)
  const [isFetching, setIsFetching] = useState(false)

  function handleOpenChange(open: boolean): void {
    if (!open) return
    tts.speak()
    if (detail) return

    setIsFetching(true)
    fetch(`/api/word-detail?word=${encodeURIComponent(word)}`)
      .then((res) =>
        res.ok ? (res.json() as Promise<WordDetailResponse>) : null,
      )
      .then((data) => {
        if (data) setDetail(data)
      })
      .catch(() => undefined)
      .finally(() => setIsFetching(false))
  }

  const isLoading = isFetching || (isAiLoading && !detail)
  const ipa = detail?.ipa ?? aiLookup?.ipa
  const meaning =
    detail?.source === 'db' ? detail.meaning : (aiLookup?.meaning ?? null)

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger render={<span />}>{children}</PopoverTrigger>
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
              {detail?.wordType && (
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-[#8a8f98]">
                  {detail.wordType}
                </span>
              )}
            </div>
            <button
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
              {ipa && (
                <span className="font-mono text-xs text-[#7170ff]">{ipa}</span>
              )}
              {meaning && <p className="text-sm text-[#d0d6e0]">{meaning}</p>}
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
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
