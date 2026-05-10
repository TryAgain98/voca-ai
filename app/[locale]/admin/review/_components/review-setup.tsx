'use client'

import { useUser } from '@clerk/nextjs'
import { Eye, Headphones, PenLine, Shuffle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import { Skeleton } from '~/components/ui/skeleton'
import { useLessons } from '~/hooks/use-lessons'
import { useReviewWords } from '~/hooks/use-word-mastery'
import { cn } from '~/lib/cn'

import type {
  ExerciseType,
  ReviewSetup,
  ReviewVocab,
} from '../_types/review.types'

type ReviewMode = ExerciseType | 'mixed'

const EXERCISE_TYPES_BY_MODE: Record<ReviewMode, ExerciseType[]> = {
  'word-to-meaning': ['word-to-meaning'],
  'meaning-to-word': ['meaning-to-word'],
  'listen-to-word': ['listen-to-word'],
  'speak-word': ['speak-word'],
  mixed: ['word-to-meaning', 'meaning-to-word', 'listen-to-word'],
}

const MODE_CONFIG = [
  {
    mode: 'word-to-meaning' as const,
    icon: Eye,
    labelKey: 'modeWordToMeaning' as const,
  },
  {
    mode: 'meaning-to-word' as const,
    icon: PenLine,
    labelKey: 'modeMeaningToWord' as const,
  },
  {
    mode: 'listen-to-word' as const,
    icon: Headphones,
    labelKey: 'modeListenToWord' as const,
  },
  { mode: 'mixed' as const, icon: Shuffle, labelKey: 'modeMixed' as const },
]

interface ReviewSetupProps {
  onStart: (setup: ReviewSetup) => void
}

export function ReviewSetup({ onStart }: ReviewSetupProps) {
  const t = useTranslations('Review')
  const { user } = useUser()
  const { data: lessons = [] } = useLessons()
  const [selectedLessons, setSelectedLessons] = useState<string[]>([])
  const [selectedMode, setSelectedMode] = useState<ReviewMode>('mixed')

  const effectiveLessonIds =
    selectedLessons.length > 0 ? selectedLessons : lessons.map((l) => l.id)

  const { data: reviewWords = [], isLoading: isVocabLoading } = useReviewWords({
    userId: user?.id ?? '',
    lessonIds: effectiveLessonIds,
    enabled: !!user?.id && effectiveLessonIds.length > 0,
  })

  const vocab: ReviewVocab[] = reviewWords.map((v) => ({
    id: v.id,
    word: v.word,
    meaning: v.meaning,
    word_type: v.word_type,
    phonetic: v.phonetic,
    example: v.example,
    synonyms: v.synonyms,
  }))

  const toggleLesson = (id: string) =>
    setSelectedLessons((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    )

  const canStart = !isVocabLoading && vocab.length >= 4

  const handleStart = () =>
    onStart({
      userId: user?.id ?? '',
      lessonIds: selectedLessons,
      exerciseTypes: EXERCISE_TYPES_BY_MODE[selectedMode],
      vocab,
    })

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 pt-4">
      <div>
        <h1 className="text-xl font-semibold">{t('setupTitle')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t('setupSubtitle')}
        </p>
      </div>

      <div className="space-y-2">
        <Label>{t('selectMode')}</Label>
        <div className="grid grid-cols-2 gap-2">
          {MODE_CONFIG.map(({ mode, icon: Icon, labelKey }) => {
            const isSelected = selectedMode === mode
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setSelectedMode(mode)}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-[510] transition-all',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <Icon size={15} />
                {t(labelKey)}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('selectLessons')}</Label>

        <div className="bg-card overflow-hidden rounded-lg border">
          <label className="bg-muted/20 hover:bg-muted/40 flex cursor-pointer items-center gap-3 border-b px-4 py-3 transition-colors">
            <Checkbox
              checked={selectedLessons.length === 0}
              onCheckedChange={() => setSelectedLessons([])}
            />
            <span className="text-sm font-medium">{t('allLessons')}</span>
          </label>

          <div className="max-h-[min(40vh,360px)] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb:hover]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent">
            {lessons.map((l) => (
              <label
                key={l.id}
                className={cn(
                  'bg-card flex cursor-pointer items-center gap-3 border-b px-4 py-2.5 text-sm transition-colors last:border-0',
                  selectedLessons.includes(l.id)
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground',
                )}
              >
                <Checkbox
                  checked={selectedLessons.includes(l.id)}
                  onCheckedChange={() => toggleLesson(l.id)}
                />
                <span className="truncate">{l.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="text-muted-foreground text-xs">
          {isVocabLoading ? (
            <Skeleton className="h-3 w-24" />
          ) : (
            <>
              {t('vocabAvailable', { count: vocab.length })}
              {!canStart && (
                <span className="text-destructive ml-2">
                  — {t('minWarning')}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <Button
        size="lg"
        onClick={handleStart}
        disabled={isVocabLoading || !canStart}
        className="w-full"
      >
        {t('startButton')}
      </Button>
    </div>
  )
}
