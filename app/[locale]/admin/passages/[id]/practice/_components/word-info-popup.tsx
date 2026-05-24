'use client'

import { Loader2, Volume2 } from 'lucide-react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { useTTS } from '~/hooks/use-tts'
import { cn } from '~/lib/utils'

import { useWordLookup } from '../_utils/passage-lookup-context'

interface WordInfoPopupProps {
  word: string
  children: React.ReactNode
}

export function WordInfoPopup({ word, children }: WordInfoPopupProps) {
  const tts = useTTS(word)
  const { wordMap, isLoading } = useWordLookup()
  const lookup = wordMap.get(word.toLowerCase())

  function handleOpenChange(open: boolean): void {
    if (open) tts.speak()
  }

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger render={<span />}>{children}</PopoverTrigger>
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
          <div className="flex items-center justify-between gap-2">
            <span className="text-base font-semibold text-[#f7f8f8]">
              {word}
            </span>
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
              {lookup?.ipa && (
                <span className="font-mono text-xs text-[#7170ff]">
                  {lookup.ipa}
                </span>
              )}
              {lookup?.meaning && (
                <p className="text-sm text-[#d0d6e0]">{lookup.meaning}</p>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
