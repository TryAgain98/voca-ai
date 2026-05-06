'use client'

import { useUser } from '@clerk/nextjs'
import { ClipboardList } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
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
    <>
      {/* Mobile: 2 tabs */}
      <div className="lg:hidden">
        <Tabs defaultValue="setup">
          <TabsList className="w-full">
            <TabsTrigger value="setup" className="flex-1">
              {t('setupTitle')}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              {t('historyTitle')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="setup" className="mt-4">
            <QuizSetup onStart={setSetup} />
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            {user?.id && <QuizHistoryTable userId={user.id} />}
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: 2 columns */}
      <div className="hidden h-full gap-8 lg:flex">
        <div className="w-100 shrink-0">
          <QuizSetup onStart={setSetup} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4 border-l pt-4 pl-8">
          <div className="flex items-center gap-2">
            <ClipboardList size={16} className="text-muted-foreground" />
            <p className="text-sm font-medium">{t('historyTitle')}</p>
          </div>
          {user?.id && <QuizHistoryTable userId={user.id} />}
        </div>
      </div>
    </>
  )
}
