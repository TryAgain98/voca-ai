import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function RootPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await currentUser()
  redirect(user ? `/${locale}/admin` : `/${locale}/sign-in`)
}
