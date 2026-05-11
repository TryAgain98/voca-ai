'use client'

import { useUser } from '@clerk/nextjs'
import { ClipboardList } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { useQuizQuickStartStore } from '~/stores/quiz-quick-start'

import { QuizSessionView } from './_components/quiz-session'
import { QuizSetup } from './_components/quiz-setup'
import { QUIZ_EXERCISE_TYPES } from './_types/quiz.types'
import { QuizHistoryTable } from './history/_components/quiz-history-table'

import type { QuizSetup as QuizSetupType } from './_types/quiz.types'

const MIN_QUICK_START_VOCAB = 1

export default function QuizPage() {
  const t = useTranslations('Quiz')
  const { user, isLoaded } = useUser()
  const [setup, setSetup] = useState<QuizSetupType | null>(null)
  const [sessionKey, setSessionKey] = useState(0)
  const userId = user?.id ?? null

  const [quickStartVocab] = useState(() => {
    const { pendingVocab, clearPendingVocab } =
      useQuizQuickStartStore.getState()
    if (pendingVocab) clearPendingVocab()
    return pendingVocab
  })

  const quickStartSetup = useMemo<QuizSetupType | null>(() => {
    if (
      !isLoaded ||
      !userId ||
      !quickStartVocab ||
      quickStartVocab.length < MIN_QUICK_START_VOCAB
    )
      return null
    return {
      userId,
      lessonIds: [],
      exerciseTypes: [...QUIZ_EXERCISE_TYPES],
      vocab: quickStartVocab,
    }
  }, [isLoaded, userId, quickStartVocab])

  const activeSetup = setup ?? quickStartSetup

  if (quickStartVocab && !isLoaded) {
    return null
  }

  if (activeSetup) {
    return (
      <QuizSessionView
        key={sessionKey}
        setup={activeSetup}
        onExit={() => {
          setSetup(null)
          setSessionKey((k) => k + 1)
        }}
      />
    )
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="shrink-0">
        <QuizSetup onStart={setSetup} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 border-t pt-5">
        <div className="flex shrink-0 items-center gap-2">
          <ClipboardList size={16} className="text-muted-foreground" />
          <p className="text-sm font-[510]">{t('historyTitle')}</p>
        </div>
        <div className="min-h-[280px] flex-1 overflow-y-auto">
          {user?.id && <QuizHistoryTable userId={user.id} />}
        </div>
      </div>
    </div>
  )
}
