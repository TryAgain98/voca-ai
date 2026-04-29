import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { AdminShell } from '~/components/layout/admin-shell'

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

  return <AdminShell>{children}</AdminShell>
}
