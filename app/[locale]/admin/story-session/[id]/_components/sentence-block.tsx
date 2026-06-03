'use client'

import { Volume2 } from 'lucide-react'

import { WordInfoPopup } from '~/components/word-info-popup'
import { useTTS } from '~/hooks/use-tts'
import { cn } from '~/lib/cn'

import type { StoryWord } from '~/types'

function tokenize(text: string): string[] {
  return text.split(/(\b[\w']+\b)/).filter(Boolean)
}

interface SentenceBlockProps {
  sentence: string
  targetWords: StoryWord[]
  onWordEnter: (meaning: string | null) => void
  onWordLeave: () => void
}

export function SentenceBlock({
  sentence,
  targetWords,
  onWordEnter,
  onWordLeave,
}: SentenceBlockProps) {
  const { speak, isSpeaking } = useTTS(sentence)
  const tokens = tokenize(sentence)

  return (
    <span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          speak()
        }}
        className={cn(
          'mr-1 inline-block rounded p-0.5 align-middle transition-colors',
          isSpeaking
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Volume2 size={12} />
      </button>
      {tokens.map((tok, i) => {
        if (!/\w/.test(tok)) return <span key={i}>{tok}</span>
        const target = targetWords.find(
          (w) => w.word.toLowerCase() === tok.toLowerCase(),
        )

        return (
          <WordInfoPopup key={i} word={tok}>
            <span
              onMouseEnter={() => onWordEnter(target?.meaning ?? null)}
              onMouseLeave={onWordLeave}
              className={cn(
                'cursor-pointer transition-colors',
                target
                  ? 'bg-primary/15 text-primary hover:bg-primary/25 rounded px-0.5 font-[590] underline decoration-dotted underline-offset-2'
                  : 'hover:text-primary',
              )}
            >
              {tok}
            </span>
          </WordInfoPopup>
        )
      })}{' '}
    </span>
  )
}
