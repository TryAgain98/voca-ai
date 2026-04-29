'use client'

import { useUser } from '@clerk/nextjs'
import { BookOpen, Shuffle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import { Skeleton } from '~/components/ui/skeleton'
import { useLessons } from '~/hooks/use-lessons'
import { useReviewWords } from '~/hooks/use-word-review-progress'

import type {
  ExerciseType,
  ReviewSetup,
  ReviewVocab,
} from '../_types/review.types'

const ALL_EXERCISE_TYPES: ExerciseType[] = [
  'word-to-meaning',
  'meaning-to-word',
  'listen-to-word',
  'speak-word',
]

interface ReviewSetupProps {
  onStart: (setup: ReviewSetup) => void
}

export function ReviewSetup({ onStart }: ReviewSetupProps) {
  const t = useTranslations('Review')
  const { user } = useUser()
  const { data: lessons = [] } = useLessons()
  const [selectedLessons, setSelectedLessons] = useState<string[]>([])

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
  }))

  const toggleLesson = (id: string) => {
    setSelectedLessons((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    )
  }

  const canStart = !isVocabLoading && vocab.length >= 4

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8 pt-4">
      <div className="flex items-center gap-3">
        <BookOpen size={28} className="text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{t('setupTitle')}</h1>
          <p className="text-muted-foreground text-sm">{t('setupSubtitle')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="space-y-3">
          <Label>{t('selectLessons')}</Label>
          <div className="space-y-2">
            <label className="hover:bg-accent/50 flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 transition-colors">
              <Checkbox
                checked={selectedLessons.length === 0}
                onCheckedChange={() => setSelectedLessons([])}
              />
              <span className="text-sm font-medium">{t('allLessons')}</span>
            </label>
            {lessons.map((l) => (
              <label
                key={l.id}
                className="hover:bg-accent/50 flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 transition-colors"
              >
                <Checkbox
                  checked={selectedLessons.includes(l.id)}
                  onCheckedChange={() => toggleLesson(l.id)}
                />
                <span className="text-sm">{l.name}</span>
              </label>
            ))}
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
          onClick={() =>
            onStart({
              userId: user?.id ?? '',
              lessonIds: selectedLessons,
              exerciseTypes: ALL_EXERCISE_TYPES,
              vocab,
            })
          }
          disabled={isVocabLoading || !canStart}
          className="w-full gap-2"
        >
          <Shuffle size={16} />
          {t('startButton')}
        </Button>
      </div>
    </div>
  )
}
