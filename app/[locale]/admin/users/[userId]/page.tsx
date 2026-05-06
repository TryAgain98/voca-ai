import { UserDetailView } from './_components/user-detail-view'

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string; locale: string }>
}) {
  const { userId } = await params

  return <UserDetailView userId={userId} />
}
