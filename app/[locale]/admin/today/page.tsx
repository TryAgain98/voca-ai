import { redirect } from 'next/navigation'

interface TodayRedirectPageProps {
  params: Promise<{ locale: string }>
}

export default async function TodayRedirectPage({
  params,
}: TodayRedirectPageProps): Promise<never> {
  const { locale } = await params
  redirect(`/${locale}/admin/plans`)
}
