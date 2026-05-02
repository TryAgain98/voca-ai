'use client'

import { useUser } from '@clerk/nextjs'
import { ArrowLeft, BrainCircuit } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

import { QuizHistoryTable } from './_components/quiz-history-table'

export default function QuizHistoryPage() {
  const t = useTranslations('Quiz')
  const { user } = useUser()

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 pt-4">
      <div className="flex items-center gap-3">
        <Link
          href="../quiz"
          className="text-muted-foreground hover:text-foreground flex h-8 w-8 items-center justify-center rounded-md transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <BrainCircuit size={24} className="text-primary" />
        <div>
          <h1 className="text-xl font-bold">{t('historyTitle')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('historySubtitle')}
          </p>
        </div>
      </div>

      {user?.id && <QuizHistoryTable userId={user.id} />}
    </div>
  )
}
