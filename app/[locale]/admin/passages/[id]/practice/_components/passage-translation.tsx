'use client'

import { useMemo } from 'react'

import { segmentsFromContent } from '~/lib/passage-segments'
import { cn } from '~/lib/utils'

interface PassageTranslationProps {
  translation: string
  hoveredSentence: number | null
  onSentenceHover: (index: number | null) => void
}

export function PassageTranslation({
  translation,
  hoveredSentence,
  onSentenceHover,
}: PassageTranslationProps) {
  const sentences = useMemo(
    () => segmentsFromContent(translation),
    [translation],
  )

  return (
    <p className="text-sm leading-relaxed italic">
      {sentences.map((sentence, i) => (
        <span key={sentence.id}>
          <span
            onMouseEnter={() => onSentenceHover(i)}
            onMouseLeave={() => onSentenceHover(null)}
            className={cn(
              'text-muted-foreground rounded px-0.5 transition-colors',
              hoveredSentence === i && 'bg-primary/15 text-foreground',
            )}
          >
            {sentence.text}
          </span>{' '}
        </span>
      ))}
    </p>
  )
}
