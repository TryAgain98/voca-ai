'use client'

import { useUser } from '@clerk/nextjs'
import { ClipboardList } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'

import { QuizSessionView } from './_components/quiz-session'
import { QuizSetup } from './_components/quiz-setup'
import { QuizHistoryTable } from './history/_components/quiz-history-table'

import type { QuizSetup as QuizSetupType } from './_types/quiz.types'

export default function QuizPage() {
  const t = useTranslations('Quiz')
  const { user } = useUser()
  const [setup, setSetup] = useState<QuizSetupType | null>(null)
  const [sessionKey, setSessionKey] = useState(0)

  if (setup) {
    return (
      <QuizSessionView
        key={sessionKey}
        setup={setup}
        onExit={() => {
          setSetup(null)
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
