import { UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { LocaleSwitcher } from '~/components/layout/locale-switcher'
import { Sidebar } from '~/components/layout/sidebar'
import { ThemeToggle } from '~/components/layout/theme-toggle'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await currentUser()
  if (!user) redirect(`/${locale}/sign-in`)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-border bg-background flex h-14 shrink-0 items-center justify-end gap-2 border-b px-5">
          <LocaleSwitcher />
          <ThemeToggle />
          <UserButton />
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
