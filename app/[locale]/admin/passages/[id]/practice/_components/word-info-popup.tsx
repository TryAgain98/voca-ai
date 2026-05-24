'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'

import type { Vocabulary } from '~/types'

interface DictEntry {
  phonetic?: string
  definition: string
  example?: string
}

const dictCache = new Map<string, DictEntry | null>()

async function fetchDictEntry(word: string): Promise<DictEntry | null> {
  const key = word.toLowerCase()
  if (dictCache.has(key)) return dictCache.get(key)!

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`,
    )
    if (!res.ok) {
      dictCache.set(key, null)
      return null
    }
    const data = (await res.json()) as Array<{
      phonetic?: string
      meanings?: Array<{
        definitions?: Array<{ definition?: string; example?: string }>
      }>
    }>
    const entry = data[0]
    const defObj = entry?.meanings?.[0]?.definitions?.[0]
    const result: DictEntry = {
      phonetic: entry?.phonetic,
      definition: defObj?.definition ?? '',
      example: defObj?.example,
    }
    dictCache.set(key, result)
    return result
  } catch {
    dictCache.set(key, null)
    return null
  }
}

interface WordInfoPopupProps {
  word: string
  vocab: Vocabulary | null
  children: React.ReactNode
}

export function WordInfoPopup({ word, vocab, children }: WordInfoPopupProps) {
  const t = useTranslations('Passages')
  const [dictEntry, setDictEntry] = useState<DictEntry | null | undefined>(
    undefined,
  )
  const [isLoading, setIsLoading] = useState(false)

  function handleOpenChange(open: boolean) {
    if (!open || vocab || dictEntry !== undefined) return
    setIsLoading(true)
    fetchDictEntry(word).then((entry) => {
      setDictEntry(entry)
      setIsLoading(false)
    })
  }

  const phonetic = vocab?.phonetic ?? dictEntry?.phonetic
  const meaning = vocab?.meaning ?? dictEntry?.definition
  const example = vocab?.example ?? dictEntry?.example

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
          <span className="text-base font-semibold text-[#f7f8f8]">{word}</span>

          {phonetic && (
            <span className="font-mono text-xs text-[#7170ff]">{phonetic}</span>
          )}

          {isLoading ? (
            <p className="text-xs text-[#8a8f98]">{t('lookingUp')}</p>
          ) : meaning ? (
            <p className="text-sm text-[#d0d6e0]">{meaning}</p>
          ) : (
            <p className="text-xs text-[#8a8f98] italic">{t('wordNotFound')}</p>
          )}

          {example && (
            <p
              className="border-t pt-2 text-xs text-[#8a8f98] italic"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              {example}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
