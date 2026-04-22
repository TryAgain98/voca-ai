import { UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { Sidebar } from '~/components/layout/sidebar'

export default async function DashboardLayout({
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
        <header className="border-border bg-background flex h-16 shrink-0 items-center justify-end border-b px-6">
          <UserButton />
        </header>
        <main className="bg-muted/30 flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
