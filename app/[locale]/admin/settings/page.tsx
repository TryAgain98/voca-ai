import { currentUser } from '@clerk/nextjs/server'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'

export default async function SettingsPage() {
  const user = await currentUser()
  if (!user) return null

  const initials = [user.firstName?.[0], user.lastName?.[0]]
    .filter(Boolean)
    .join('')

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Manage your account information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user.imageUrl} alt={user.fullName ?? ''} />
              <AvatarFallback className="text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user.fullName ?? 'No name'}</p>
              <p className="text-muted-foreground text-sm">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>

          <Separator />

          <dl className="space-y-3 text-sm">
            <Row label="User ID">
              <span className="font-mono text-xs break-all">{user.id}</span>
            </Row>
            <Row label="Email verified">
              {user.primaryEmailAddress?.verification?.status === 'verified'
                ? 'Yes'
                : 'No'}
            </Row>
            <Row label="Member since">
              {new Date(user.createdAt ?? 0).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Row>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-4">
      <dt className="text-muted-foreground w-32 shrink-0">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
