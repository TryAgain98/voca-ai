'use client'

import { BookOpen, Shuffle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import { useLessons } from '~/hooks/use-lessons'
import { useVocabulariesByLessons } from '~/hooks/use-vocabularies'

import type {
  ExerciseType,
  ReviewSetup,
  ReviewVocab,
} from '../_types/review.types'

const ALL_EXERCISE_TYPES: ExerciseType[] = [
  'word-to-meaning',
  'meaning-to-word',
  'listen-to-word',
]

interface ReviewSetupProps {
  onStart: (setup: ReviewSetup) => void
}

export function ReviewSetup({ onStart }: ReviewSetupProps) {
  const t = useTranslations('Review')
  const { data: lessons = [] } = useLessons()
  const [selectedLessons, setSelectedLessons] = useState<string[]>([])

  const { data: rawVocab = [] } = useVocabulariesByLessons(
    selectedLessons.length > 0 ? selectedLessons : undefined,
  )

  const vocab: ReviewVocab[] = rawVocab.map((v) => ({
    id: v.id,
    word: v.word,
    meaning: v.meaning,
    word_type: v.word_type,
  }))
  console.log({ vocab })

  const toggleLesson = (id: string) => {
    setSelectedLessons((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    )
  }

  const canStart = vocab.length >= 4

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
          <p className="text-muted-foreground text-xs">
            {t('vocabAvailable', { count: vocab.length })}
            {!canStart && (
              <span className="text-destructive ml-2">— {t('minWarning')}</span>
            )}
          </p>
        </div>

        <Button
          size="lg"
          onClick={() =>
            onStart({
              lessonIds: selectedLessons,
              exerciseTypes: ALL_EXERCISE_TYPES,
              vocab,
            })
          }
          disabled={!canStart}
          className="w-full gap-2"
        >
          <Shuffle size={16} />
          {t('startButton')}
        </Button>
      </div>
    </div>
  )
}
