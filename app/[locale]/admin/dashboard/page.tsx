'use client'

import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { buttonVariants } from '~/components/ui/button'
import { useAdminUsers } from '~/hooks/use-admin-users'
import { useQuizPerformance } from '~/hooks/use-quiz-sessions'
import { useStreak } from '~/hooks/use-streak'
import { useDashboardStats, useReviewForecast } from '~/hooks/use-word-mastery'
import { dayjs } from '~/lib/dayjs'

import { MasteryCard } from './_components/mastery-card'
import { ReviewForecastCard } from './_components/review-forecast-card'
import { SmartHeroCard } from './_components/smart-hero-card'
import { StreakCard } from './_components/streak-card'
import { TestPerformanceCard } from './_components/test-performance-card'
import { TrickyWordsCard } from './_components/tricky-words-card'

function getGreeting(): 'morning' | 'afternoon' | 'evening' {
  const hour = dayjs().hour()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

const GREETING_EMOJI = { morning: '☀️', afternoon: '👋', evening: '🌙' }

export default function DashboardPage() {
  const t = useTranslations('Dashboard')
  const { user } = useUser()
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = params.locale as string

  const viewAs = searchParams.get('viewAs') ?? ''
  const isViewMode = !!viewAs
  const userId = viewAs || user?.id || ''

  const { data: viewAsUser } = useAdminUsers()
  const viewedUser = isViewMode
    ? viewAsUser?.find((u) => u.id === viewAs)
    : null

  const { data: stats, isLoading } = useDashboardStats(userId)
  const { data: perf, isLoading: isPerfLoading } = useQuizPerformance(userId)
  const { data: streak, isLoading: isStreakLoading } = useStreak(userId)
  const { data: forecast, isLoading: isForecastLoading } =
    useReviewForecast(userId)

  const greeting = getGreeting()
  const firstName = isViewMode
    ? (viewedUser?.firstName ?? viewedUser?.username ?? '')
    : (user?.firstName ?? user?.username ?? '')

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {isViewMode && (
        <div className="border-border bg-card flex items-center justify-between gap-3 rounded-xl border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-[590]">
              👁
            </span>
            <p className="text-muted-foreground text-sm">
              {t('viewingBanner', { name: firstName || '...' })}
            </p>
          </div>
          <Link
            href={`/${locale}/admin/users`}
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            <ArrowLeft size={13} className="mr-1" />
            {t('viewingBannerBack')}
          </Link>
        </div>
      )}

      {!isViewMode && (
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
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StreakCard streak={streak} isLoading={isStreakLoading} />
        <MasteryCard
          totalWords={stats?.totalWords ?? 0}
          masteredCount={stats?.masteredCount ?? 0}
          practicingCount={stats?.practicingCount ?? 0}
          isLoading={isLoading}
          viewAs={viewAs || undefined}
        />
      </div>

      <SmartHeroCard
        needsTestingCount={stats?.needsTestingCount ?? 0}
        needsTestingWords={stats?.needsTestingWords ?? []}
        unlearnedCount={stats?.unlearnedCount ?? 0}
        unlearnedWords={stats?.unlearnedWords ?? []}
        relearningCount={stats?.relearningCount ?? 0}
        relearningWords={stats?.relearningWords ?? []}
        wrongTodayCount={stats?.wrongTodayCount ?? 0}
        wrongTodayWords={stats?.wrongTodayWords ?? []}
        masteredCount={stats?.masteredCount ?? 0}
        totalWords={stats?.totalWords ?? 0}
        isLoading={isLoading}
        isViewMode={isViewMode}
      />

      <ReviewForecastCard forecast={forecast} isLoading={isForecastLoading} />

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
