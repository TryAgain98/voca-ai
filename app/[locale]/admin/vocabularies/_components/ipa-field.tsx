'use client'

import { Keyboard, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

import { SuggestionHint } from '~/app/[locale]/admin/vocabularies/_components/suggestion-hint'
import { Button, buttonVariants } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { cn } from '~/lib/utils'

import type { UseSuggestionReturn } from '~/app/[locale]/admin/vocabularies/_hooks/use-translation-suggestion'

const IPA_GROUPS = [
  {
    labelKey: 'ipaShortVowels' as const,
    symbols: ['ɪ', 'e', 'æ', 'ɒ', 'ʌ', 'ʊ', 'ə'],
  },
  {
    labelKey: 'ipaLongVowels' as const,
    symbols: ['iː', 'ɑː', 'ɔː', 'uː', 'ɜː'],
  },
  {
    labelKey: 'ipaDiphthongs' as const,
    symbols: ['eɪ', 'aɪ', 'ɔɪ', 'əʊ', 'aʊ', 'ɪə', 'eə', 'ʊə'],
  },
  {
    labelKey: 'ipaConsonants' as const,
    symbols: [
      'p',
      'b',
      't',
      'd',
      'k',
      'g',
      'f',
      'v',
      'θ',
      'ð',
      's',
      'z',
      'ʃ',
      'ʒ',
      'tʃ',
      'dʒ',
      'm',
      'n',
      'ŋ',
      'h',
      'l',
      'r',
      'j',
      'w',
    ],
  },
  {
    labelKey: 'ipaMarkers' as const,
    symbols: ['ˈ', 'ˌ', 'ː', '/'],
  },
] as const

interface IpaFieldProps {
  value: string
  error?: string
  required?: boolean
  suggestion: UseSuggestionReturn
  onChange: (v: string) => void
}

export function IpaField({
  value,
  error,
  required,
  suggestion,
  onChange,
}: IpaFieldProps) {
  const t = useTranslations('Vocabularies')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const restoreCursor = (pos: number) => {
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.setSelectionRange(pos, pos)
    })
  }

  const handleInsert = (symbol: string) => {
    const input = inputRef.current
    const start = input?.selectionStart ?? value.length
    const end = input?.selectionEnd ?? value.length
    const newValue = value.slice(0, start) + symbol + value.slice(end)
    const newPos = start + [...symbol].length
    onChange(newValue)
    restoreCursor(newPos)
  }

  const handleBackspace = () => {
    const input = inputRef.current
    const start = input?.selectionStart ?? value.length
    const end = input?.selectionEnd ?? value.length
    if (start !== end) {
      onChange(value.slice(0, start) + value.slice(end))
      restoreCursor(start)
    } else if (start > 0) {
      const before = [...value.slice(0, start)].slice(0, -1).join('')
      onChange(before + value.slice(start))
      restoreCursor(before.length)
    }
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor="phonetic">
        {t('phoneticLabel')}{' '}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex gap-1.5">
        <Input
          ref={inputRef}
          id="phonetic"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/wɜːrd/"
          className="flex-1 font-mono"
          aria-invalid={!!error}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            type="button"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'icon' }),
              'shrink-0',
            )}
            aria-label={t('ipaPickerOpen')}
          >
            <Keyboard size={16} />
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="end" side="bottom">
            <div className="space-y-3">
              {IPA_GROUPS.map((group) => (
                <div key={group.labelKey}>
                  <p className="text-muted-foreground mb-1.5 text-xs font-medium">
                    {t(group.labelKey)}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {group.symbols.map((symbol) => (
                      <Button
                        key={symbol}
                        type="button"
                        variant="outline"
                        className="h-8 min-w-8 px-1.5 font-mono text-sm"
                        onClick={() => handleInsert(symbol)}
                      >
                        {symbol}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleBackspace}
                  disabled={!value}
                >
                  ⌫ {t('ipaBackspace')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange('')}
                  disabled={!value}
                >
                  <X size={13} />
                  {t('ipaClear')}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <SuggestionHint
        suggestion={suggestion.suggestion}
        isLoading={suggestion.isLoading}
      />
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}
