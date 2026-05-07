'use client'

import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { buttonVariants } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { useAdminUsers } from '~/hooks/use-admin-users'
import { useDashboardStats } from '~/hooks/use-word-mastery'
import { LearnedStatsCard } from '~admin/dashboard/_components/learned-stats-card'
import { MemoryStrengthCard } from '~admin/dashboard/_components/memory-strength-card'
import { UnlearnedCard } from '~admin/dashboard/_components/unlearned-card'

import { UserScoreBadge } from '../../_components/user-score-badge'

interface UserDetailViewProps {
  userId: string
}

export function UserDetailView({ userId }: UserDetailViewProps) {
  const t = useTranslations('Users')
  const params = useParams()
  const locale = params.locale as string

  const { data: allUsers = [], isLoading: isLoadingUsers } = useAdminUsers()
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats(userId)

  const user = allUsers.find((u) => u.id === userId)

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
  const displayName =
    fullName || user?.username || user?.email.split('@')[0] || '—'
  const initials = (fullName || user?.email || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const joinedDate = user?.createdAt
    ? new Intl.DateTimeFormat(locale, {
        month: 'short',
        year: 'numeric',
      }).format(new Date(user.createdAt))
    : null

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href={`/${locale}/admin/users`}
        className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' -ml-2'}
      >
        <ArrowLeft size={14} className="mr-1" />
        {t('backToUsers')}
      </Link>

      <div className="border-border bg-card rounded-xl border p-6">
        {isLoadingUsers ? (
          <div className="flex items-center gap-5">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-14 w-20" />
          </div>
        ) : (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                  sizes="64px"
                  priority
                />
              ) : (
                <div className="bg-muted flex h-full w-full items-center justify-center">
                  <span className="text-muted-foreground text-lg font-[590]">
                    {initials}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1">
              <h1 className="text-foreground text-xl font-[590] tracking-[-0.4px]">
                {displayName}
              </h1>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
              {joinedDate && (
                <p className="text-muted-foreground text-xs">
                  {t('joinedAt', { date: joinedDate })}
                </p>
              )}
              {user && (
                <p className="text-muted-foreground mt-1 text-xs font-[510]">
                  {t('rankLabel', { rank: user.rank })}
                  {user.quizCount > 0 && (
                    <span className="ml-2">
                      · {t('quizSessions', { count: user.quizCount })}
                    </span>
                  )}
                </p>
              )}
            </div>

            {user && (
              <div className="shrink-0">
                <UserScoreBadge score={user.score} size="lg" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <LearnedStatsCard
          totalWords={stats?.totalWords ?? 0}
          learnedCount={stats?.learnedCount ?? 0}
          isLoading={isLoadingStats}
        />
        <UnlearnedCard
          unlearnedCount={stats?.unlearnedCount ?? 0}
          unlearnedWords={stats?.unlearnedWords ?? []}
          isLoading={isLoadingStats}
        />
        <MemoryStrengthCard
          averageRetention={stats?.averageRetention ?? 1}
          fadingCount={stats?.fadingCount ?? 0}
          relearningCount={stats?.relearningCount ?? 0}
          isLoading={isLoadingStats}
        />
      </div>
    </div>
  )
}
