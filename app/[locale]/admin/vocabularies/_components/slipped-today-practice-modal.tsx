'use client'

import { Eye, Headphones, Mic, PenLine, Shuffle } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog'
import { cn } from '~/lib/cn'
import { useReviewQuickStartStore } from '~/stores/review-quick-start'

import type {
  ExerciseType,
  ReviewVocab,
} from '~admin/review/_types/review.types'

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
  {
    mode: 'speak-word' as const,
    icon: Mic,
    labelKey: 'modeSpeakWord' as const,
  },
  { mode: 'mixed' as const, icon: Shuffle, labelKey: 'modeMixed' as const },
]

interface SlippedTodayPracticeModalProps {
  open: boolean
  vocab: ReviewVocab[]
  onClose: () => void
}

export function SlippedTodayPracticeModal({
  open,
  vocab,
  onClose,
}: SlippedTodayPracticeModalProps): React.ReactElement {
  const t = useTranslations('Review')
  const tVoca = useTranslations('Vocabularies')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const setPendingVocab = useReviewQuickStartStore((s) => s.setPendingVocab)
  const [selectedMode, setSelectedMode] = useState<ReviewMode>('mixed')

  const canStart = vocab.length >= 4

  const handleStart = () => {
    if (!canStart) return
    setPendingVocab(vocab, EXERCISE_TYPES_BY_MODE[selectedMode])
    onClose()
    router.push(`/${locale}/admin/review`)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tVoca('slippedTodayPracticeModalTitle')}</DialogTitle>
          <DialogDescription>
            {tVoca('slippedTodayPracticeModalDesc', { count: vocab.length })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-sm font-[510]">{t('selectMode')}</p>
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

        <Button
          size="lg"
          onClick={handleStart}
          disabled={!canStart}
          className="w-full"
        >
          {t('startButton')}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
