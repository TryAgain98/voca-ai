import { currentUser } from '@clerk/nextjs/server'
import { LogOut, Mail, User } from 'lucide-react'

export default async function DashboardPage() {
  const user = await currentUser()
  if (!user) return null

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Welcome back, {user.firstName}!
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex items-center gap-4">
          {user.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt={user.fullName ?? 'avatar'}
              className="h-14 w-14 rounded-full object-cover"
            />
          )}
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {user.fullName ?? 'No name'}
            </h2>
            <p className="text-sm text-zinc-500">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>

        <hr className="my-5 border-zinc-100 dark:border-zinc-700" />

        <dl className="space-y-3 text-sm">
          <Row icon={<User size={14} />} label="User ID" value={user.id} />
          <Row
            icon={<Mail size={14} />}
            label="Email verified"
            value={
              user.primaryEmailAddress?.verification?.status === 'verified'
                ? 'Yes'
                : 'No'
            }
          />
          <Row
            icon={<LogOut size={14} />}
            label="Created at"
            value={new Date(user.createdAt ?? 0).toLocaleString()}
          />
        </dl>
      </div>
    </div>
  )
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-zinc-400">{icon}</span>
      <span className="w-28 shrink-0 font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      <span className="break-all text-zinc-800 dark:text-zinc-200">
        {value}
      </span>
    </div>
  )
}
