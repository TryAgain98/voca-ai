import { UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { LogOut, Mail, User } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) redirect('/sign-in')

  return (
    <main className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <UserButton />
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center gap-4">
            {user.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.imageUrl}
                alt={user.fullName ?? 'avatar'}
                className="h-16 w-16 rounded-full object-cover"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
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

        <Link
          href="/"
          className="mt-4 inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Back to home
        </Link>
      </div>
    </main>
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
