'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { useCreateStorySession } from '~/hooks/use-story-session'
import { cn } from '~/lib/cn'

import type { StoryGenre, StoryWord } from '~/types'

const GENRES: { value: StoryGenre; label: string; emoji: string }[] = [
  { value: 'horror', label: 'Ma mị', emoji: '👻' },
  { value: 'romance', label: 'Lãng mạn', emoji: '💕' },
  { value: 'anime', label: 'Anime', emoji: '⚔️' },
  { value: 'comedy', label: 'Hài hước', emoji: '😂' },
  { value: 'drama', label: 'Kịch tính', emoji: '🎭' },
  { value: 'scifi', label: 'Viễn tưởng', emoji: '🚀' },
  { value: 'detective', label: 'Trinh thám', emoji: '🔍' },
  { value: 'adventure', label: 'Phiêu lưu', emoji: '🗺️' },
]

interface StoryGenrePickerProps {
  userId: string
  wrongWords: StoryWord[]
  locale?: string
}

export function StoryGenrePicker({
  userId,
  wrongWords,
  locale: localeProp,
}: StoryGenrePickerProps) {
  const t = useTranslations('Review')
  const params = useParams()
  const locale = localeProp ?? (params.locale as string)
  const [selected, setSelected] = useState<StoryGenre | null>(null)

  const { mutate: createSession, isPending } = useCreateStorySession({
    userId,
    locale,
  })

  function handleGenreClick(value: StoryGenre) {
    if (isPending) return
    setSelected((prev) => (prev === value ? null : value))
  }

  function handleCreate() {
    if (!selected) return
    createSession({ genre: selected, wrongWords })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-2">
        {GENRES.map((g) => (
          <button
            key={g.value}
            onClick={() => handleGenreClick(g.value)}
            disabled={isPending}
            className={cn(
              'bg-card flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs transition-all',
              isPending && 'cursor-not-allowed opacity-50',
              selected === g.value
                ? 'border-primary bg-primary/5 text-foreground'
                : 'text-muted-foreground hover:border-border/60 hover:text-foreground',
            )}
          >
            <span className="text-lg">{g.emoji}</span>
            <span className="font-[510]">{g.label}</span>
          </button>
        ))}
      </div>

      <Button
        className="w-full"
        disabled={!selected || isPending}
        onClick={handleCreate}
      >
        {isPending ? t('storyGenerating') : t('storyCreate')}
      </Button>
    </div>
  )
}
