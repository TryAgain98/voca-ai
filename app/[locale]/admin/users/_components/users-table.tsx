'use client'

import { ChevronRight, Search } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { Input } from '~/components/ui/input'
import { Skeleton } from '~/components/ui/skeleton'
import { cn } from '~/lib/cn'

import { UserScoreBadge } from './user-score-badge'

import type { AdminUser } from '~/hooks/use-admin-users'

const RANK_MEDALS = ['🥇', '🥈', '🥉'] as const

interface UsersTableProps {
  users: AdminUser[]
  isLoading: boolean
}

function RankCell({ rank }: { rank: number }) {
  const medal = rank <= 3 ? RANK_MEDALS[rank - 1] : null
  return (
    <div className="flex items-center justify-center">
      {medal ? (
        <span className="text-xl leading-none">{medal}</span>
      ) : (
        <span className="text-muted-foreground text-sm font-[510] tabular-nums">
          {rank}
        </span>
      )}
    </div>
  )
}

function UserCell({ user }: { user: AdminUser }) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
  const displayName = fullName || user.username || user.email.split('@')[0]
  const initials = (fullName || user.email)
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={displayName ?? ''}
            fill
            className="object-cover"
            sizes="36px"
          />
        ) : (
          <div className="bg-muted flex h-full w-full items-center justify-center">
            <span className="text-muted-foreground text-xs font-[590]">
              {initials}
            </span>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-foreground truncate text-sm font-[510]">
          {displayName}
        </p>
        <p className="text-muted-foreground truncate text-xs">{user.email}</p>
        {user.phone && (
          <p className="text-muted-foreground truncate text-xs">{user.phone}</p>
        )}
      </div>
    </div>
  )
}

function ProgressCell({
  learnedCount,
  totalWords,
}: {
  learnedCount: number
  totalWords: number
}) {
  const t = useTranslations('Users')
  const percent =
    totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0

  if (totalWords === 0)
    return <span className="text-muted-foreground text-xs">—</span>

  return (
    <div className="w-28 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">
          {t('words', { learned: learnedCount, total: totalWords })}
        </span>
        <span className="text-muted-foreground text-xs tabular-nums">
          {percent}%
        </span>
      </div>
      <div className="bg-muted h-1 overflow-hidden rounded-full">
        <div
          className="h-full rounded-full bg-[#5e6ad2] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function DueTodayCell({ count }: { count: number }) {
  const isUrgent = count > 10
  const isMedium = count > 5

  return (
    <span
      className={cn(
        'text-sm font-[510] tabular-nums',
        isUrgent
          ? 'text-red-400'
          : isMedium
            ? 'text-amber-400'
            : 'text-muted-foreground',
      )}
    >
      {count}
    </span>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="border-border flex items-center gap-4 rounded-lg border p-4"
        >
          <Skeleton className="h-5 w-8" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-5 w-8" />
        </div>
      ))}
    </div>
  )
}

export function UsersTable({ users, isLoading }: UsersTableProps) {
  const t = useTranslations('Users')
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return users
    return users.filter((u) => {
      const name = [u.firstName, u.lastName, u.username]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return (
        name.includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? '').includes(q)
      )
    })
  }, [users, query])

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search
          size={14}
          className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <div className="text-muted-foreground py-16 text-center text-sm">
          {t('noResults')}
        </div>
      ) : (
        <div className="border-border overflow-hidden rounded-xl border">
          <table className="w-full">
            <thead>
              <tr className="border-border border-b">
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-[510] tracking-wider uppercase">
                  {t('colRank')}
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-[510] tracking-wider uppercase">
                  {t('colUser')}
                </th>
                <th className="text-muted-foreground px-4 py-3 text-center text-xs font-[510] tracking-wider uppercase">
                  {t('colScore')}
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-left text-xs font-[510] tracking-wider uppercase md:table-cell">
                  {t('colProgress')}
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-center text-xs font-[510] tracking-wider uppercase sm:table-cell">
                  {t('colDueToday')}
                </th>
                <th className="w-8 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  onClick={() =>
                    router.push(`/${locale}/admin/dashboard?viewAs=${user.id}`)
                  }
                  className="border-border cursor-pointer border-t transition-colors first:border-t-0 hover:bg-white/2"
                >
                  <td className="w-14 px-4 py-4 text-center">
                    <RankCell rank={user.rank} />
                  </td>
                  <td className="px-4 py-4">
                    <UserCell user={user} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <UserScoreBadge
                      score={user.score}
                      breakdown={user.scoreBreakdown}
                    />
                  </td>
                  <td className="hidden px-4 py-4 md:table-cell">
                    <ProgressCell
                      learnedCount={user.learnedCount}
                      totalWords={user.totalWords}
                    />
                  </td>
                  <td className="hidden px-4 py-4 text-center sm:table-cell">
                    <DueTodayCell count={user.dueCount} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <ChevronRight
                      size={16}
                      className="text-muted-foreground/40 inline-block"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
