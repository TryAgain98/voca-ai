'use client'

import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

import { useDashboardStats } from '~/hooks/use-word-review-progress'

import { DueTodayCard } from './_components/due-today-card'
import { LearnedStatsCard } from './_components/learned-stats-card'
import { UnlearnedCard } from './_components/unlearned-card'

function getGreeting(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

const GREETING_EMOJI = { morning: '☀️', afternoon: '👋', evening: '🌙' }

export default function DashboardPage() {
  const t = useTranslations('Dashboard')
  const { user } = useUser()
  const { data: stats, isLoading } = useDashboardStats(user?.id ?? '')

  const greeting = getGreeting()
  const firstName = user?.firstName ?? user?.username ?? ''

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-foreground text-2xl font-[590] tracking-[-0.5px]">
          {t(`greeting.${greeting}`)}
          {firstName ? `, ${firstName}` : ''} {GREETING_EMOJI[greeting]}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t('greetingSubtitle')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <LearnedStatsCard
          totalWords={stats?.totalWords ?? 0}
          learnedCount={stats?.learnedCount ?? 0}
          isLoading={isLoading}
        />
        <UnlearnedCard
          unlearnedCount={stats?.unlearnedCount ?? 0}
          unlearnedWords={stats?.unlearnedWords ?? []}
          isLoading={isLoading}
        />
        <DueTodayCard
          dueTodayCount={stats?.dueTodayCount ?? 0}
          dueTodayWords={stats?.dueTodayWords ?? []}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
