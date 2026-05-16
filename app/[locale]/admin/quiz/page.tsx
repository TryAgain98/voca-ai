'use client'

import { useUser } from '@clerk/nextjs'
import { ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'

import { useQuizQuickStartStore } from '~/stores/quiz-quick-start'

import { QuizSessionView } from './_components/quiz-session'
import { QuizSetup } from './_components/quiz-setup'
import { QUIZ_EXERCISE_TYPES } from './_types/quiz.types'

import type { QuizSetup as QuizSetupType } from './_types/quiz.types'

const MIN_QUICK_START_VOCAB = 1

export default function QuizPage() {
  const t = useTranslations('Quiz')
  const locale = useLocale()
  const { user, isLoaded } = useUser()
  const [setup, setSetup] = useState<QuizSetupType | null>(null)
  const [sessionKey, setSessionKey] = useState(0)
  const userId = user?.id ?? null

  const [quickStartVocab, setQuickStartVocab] = useState(
    () => useQuizQuickStartStore.getState().pendingVocab,
  )

  useEffect(() => {
    useQuizQuickStartStore.getState().clearPendingVocab()
  }, [])

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

  const handleExit = () => {
    setSetup(null)
    setQuickStartVocab(null)
    setSessionKey((k) => k + 1)
  }

  if (quickStartVocab && !isLoaded) {
    return null
  }

  if (activeSetup) {
    return (
      <QuizSessionView
        key={sessionKey}
        setup={activeSetup}
        onExit={handleExit}
      />
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <QuizSetup onStart={setSetup} />

      <div className="mx-auto flex w-full max-w-lg justify-center">
        <Link
          href={`/${locale}/admin/quiz/history`}
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
        >
          <ClipboardList size={16} className="text-muted-foreground" />
          <span>{t('viewHistory')}</span>
        </Link>
      </div>
    </div>
  )
}
