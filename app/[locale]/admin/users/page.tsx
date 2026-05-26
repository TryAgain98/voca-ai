'use client'

import { useTranslations } from 'next-intl'

import { useAdminUsers } from '~/hooks/use-admin-users'

import { UsersTable } from './_components/users-table'

export default function UsersPage() {
  const t = useTranslations('Users')
  const { data: users = [], isLoading } = useAdminUsers()

  return (
    <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-foreground text-2xl leading-7 font-[590] tracking-[-0.5px]">
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-0.5 text-sm leading-5">
          {t('subtitle')}
        </p>
      </div>

      <UsersTable users={users} isLoading={isLoading} />
    </div>
  )
}
