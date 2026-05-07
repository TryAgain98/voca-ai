'use client'

import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

import { useQuizPerformance } from '~/hooks/use-quiz-sessions'
import { useDashboardStats } from '~/hooks/use-word-review-progress'

import { MasteryCard } from './_components/mastery-card'
import { MemoryStrengthCard } from './_components/memory-strength-card'
import { SmartHeroCard } from './_components/smart-hero-card'
import { TestPerformanceCard } from './_components/test-performance-card'
import { TrickyWordsCard } from './_components/tricky-words-card'

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
  const userId = user?.id ?? ''
  const { data: stats, isLoading } = useDashboardStats(userId)
  const { data: perf, isLoading: isPerfLoading } = useQuizPerformance(userId)

  const greeting = getGreeting()
  const firstName = user?.firstName ?? user?.username ?? ''

  return (
    <div className="mx-auto max-w-5xl space-y-6">
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

      <SmartHeroCard
        needsTestingCount={stats?.needsTestingCount ?? 0}
        needsTestingWords={stats?.needsTestingWords ?? []}
        dueTodayCount={stats?.dueTodayCount ?? 0}
        dueTodayWords={stats?.dueTodayWords ?? []}
        unlearnedCount={stats?.unlearnedCount ?? 0}
        unlearnedWords={stats?.unlearnedWords ?? []}
        relearningCount={stats?.relearningCount ?? 0}
        relearningWords={stats?.relearningWords ?? []}
        masteredCount={stats?.masteredCount ?? 0}
        totalWords={stats?.totalWords ?? 0}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MasteryCard
          totalWords={stats?.totalWords ?? 0}
          masteredCount={stats?.masteredCount ?? 0}
          practicingCount={stats?.practicingCount ?? 0}
          isLoading={isLoading}
        />
        <MemoryStrengthCard
          averageRetention={stats?.averageRetention ?? 1}
          fadingCount={stats?.fadingCount ?? 0}
          relearningCount={stats?.relearningCount ?? 0}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TestPerformanceCard
          recentAverage={perf?.recentAverage ?? 0}
          sessionsThisWeek={perf?.sessionsThisWeek ?? 0}
          recentScores={perf?.recentScores ?? []}
          totalSessions={perf?.totalSessions ?? 0}
          isLoading={isPerfLoading}
        />
        <TrickyWordsCard
          trickyWords={perf?.trickyWords ?? []}
          totalSessions={perf?.totalSessions ?? 0}
          isLoading={isPerfLoading}
        />
      </div>
    </div>
  )
}
