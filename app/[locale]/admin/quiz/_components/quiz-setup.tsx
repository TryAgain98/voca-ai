'use client'

import { BrainCircuit, Shuffle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '~/components/ui/select'
import { useLessons } from '~/hooks/use-lessons'
import { useVocabularies } from '~/hooks/use-vocabularies'
import { cn } from '~/lib/cn'

import type {
  QuizMode,
  QuizSetup,
  QuizVocab,
} from '~/app/[locale]/admin/quiz/_types/quiz.types'

const MIN_MC = 4
const MIN_MATCHING = 3

interface QuizSetupProps {
  onStart: (setup: QuizSetup) => void
}

export function QuizSetupScreen({ onStart }: QuizSetupProps) {
  const t = useTranslations('Quiz')
  const { data: lessons = [] } = useLessons()
  const [lessonId, setLessonId] = useState('')
  const [mode, setMode] = useState<QuizMode>('multiple-choice')

  const { data: vocabData = [] } = useVocabularies(lessonId || undefined)

  const vocab: QuizVocab[] = vocabData.map((v) => ({
    id: v.id,
    word: v.word,
    meaning: v.meaning,
  }))

  const minRequired = mode === 'multiple-choice' ? MIN_MC : MIN_MATCHING
  const canStart = lessonId !== '' && vocab.length >= minRequired

  const handleStart = () => {
    if (!canStart) return
    onStart({ lessonId, mode, vocab })
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8 pt-4">
      <div className="flex items-center gap-3">
        <BrainCircuit size={28} className="text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{t('setupTitle')}</h1>
          <p className="text-muted-foreground text-sm">{t('setupSubtitle')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Lesson selector */}
        <div className="space-y-2">
          <Label>{t('selectLesson')}</Label>
          <Select value={lessonId} onValueChange={(v) => setLessonId(v ?? '')}>
            <SelectTrigger>
              <span
                className={cn(
                  'flex flex-1 truncate text-left text-sm',
                  !lessonId && 'text-muted-foreground',
                )}
              >
                {lessonId
                  ? (lessons.find((l) => l.id === lessonId)?.name ??
                    t('lessonPlaceholder'))
                  : t('lessonPlaceholder')}
              </span>
            </SelectTrigger>
            <SelectContent>
              {lessons.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {lessonId && (
            <p className="text-muted-foreground text-xs">
              {t('wordsAvailable', { count: vocab.length })}
              {vocab.length < minRequired && (
                <span className="text-destructive ml-2">
                  —{' '}
                  {mode === 'multiple-choice'
                    ? t('minWarningMC')
                    : t('minWarningMatching')}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Mode selector */}
        <div className="space-y-2">
          <Label>{t('modeLabel')}</Label>
          <div className="grid grid-cols-2 gap-3">
            {(['multiple-choice', 'matching'] as QuizMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'rounded-xl border-2 p-4 text-left transition-all',
                  mode === m
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40',
                )}
              >
                <div className="mb-1 text-sm font-semibold">
                  {m === 'multiple-choice' ? t('modeMC') : t('modeMatching')}
                </div>
                <div className="text-muted-foreground text-xs">
                  {m === 'multiple-choice'
                    ? t('modeMCDesc')
                    : t('modeMatchingDesc')}
                </div>
              </button>
            ))}
          </div>
        </div>

        <Button
          size="lg"
          onClick={handleStart}
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
