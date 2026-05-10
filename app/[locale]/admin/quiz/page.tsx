'use client'

import { useUser } from '@clerk/nextjs'
import { ClipboardList } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'

import { useQuizQuickStartStore } from '~/stores/quiz-quick-start'

import { QuizSessionView } from './_components/quiz-session'
import { QuizSetup } from './_components/quiz-setup'
import { QuizHistoryTable } from './history/_components/quiz-history-table'

import type { QuizSetup as QuizSetupType } from './_types/quiz.types'

// speak-word disabled in quiz: speech recognition isn't reliable enough
// to score mastery fairly. Re-enable once accuracy improves.
const QUICK_START_EXERCISE_TYPES = [
  'meaning-to-word',
  'listen-to-word',
  // 'speak-word',
] as const
const MIN_QUICK_START_VOCAB = 1

export default function QuizPage() {
  const t = useTranslations('Quiz')
  const { user } = useUser()
  const [setup, setSetup] = useState<QuizSetupType | null>(null)
  const [sessionKey, setSessionKey] = useState(0)
  const pendingVocab = useQuizQuickStartStore((s) => s.pendingVocab)
  const clearPendingVocab = useQuizQuickStartStore((s) => s.clearPendingVocab)
  const userId = user?.id ?? null

  useEffect(() => {
    return () => {
      clearPendingVocab()
    }
  }, [clearPendingVocab])

  const quickStartSetup = useMemo<QuizSetupType | null>(() => {
    if (!userId || !pendingVocab) return null
    if (pendingVocab.length < MIN_QUICK_START_VOCAB) return null
    return {
      userId,
      lessonIds: [],
      exerciseTypes: [...QUICK_START_EXERCISE_TYPES],
      vocab: pendingVocab,
    }
  }, [userId, pendingVocab])

  const activeSetup = setup ?? quickStartSetup

  if (activeSetup) {
    return (
      <QuizSessionView
        key={sessionKey}
        setup={activeSetup}
        onExit={() => {
          setSetup(null)
          clearPendingVocab()
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
