'use client'

import { SignInButton, SignOutButton, UserButton, useUser } from '@clerk/nextjs'
import { useForm, parse } from '@conform-to/react'
import { motion } from 'framer-motion'
import {
  Download,
  Bell,
  Globe,
  Minus,
  Plus,
  RotateCcw,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import NProgress from 'nprogress'
import { useState } from 'react'
import { toast } from 'sonner'

import { usePosts } from '~/hooks/use-posts'
import { cn } from '~/lib/cn'
import { usd, vnd } from '~/lib/currency'
import { dayjs } from '~/lib/dayjs'
import { contactSchema } from '~/lib/schemas'
import { useCounterStore } from '~/stores/counter'

export default function HomePage() {
  const t = useTranslations('home')
  const locale = useLocale()
  const router = useRouter()

  const { user, isSignedIn } = useUser()
  const { count, increment, decrement, reset } = useCounterStore()

  const [fetchEnabled, setFetchEnabled] = useState(false)
  const { data: posts, isFetching } = usePosts(fetchEnabled)

  const [form, fields] = useForm({
    shouldValidate: 'onBlur',
    onValidate({ formData }) {
      return parse(formData, {
        resolve(payload) {
          const result = contactSchema.safeParse(payload)
          if (result.success) return { value: result.data }
          const error: Record<string, string[]> = {}
          for (const issue of result.error.issues) {
            const key = issue.path.join('.') || '_'
            error[key] = [...(error[key] ?? []), issue.message]
          }
          return { error }
        },
      })
    },
    onSubmit(event, { submission }) {
      event.preventDefault()
      if (submission?.status === 'success') {
        toast.success(t('toastSuccess'))
        form.reset()
      }
    },
  })

  function switchLocale() {
    NProgress.start()
    const next = locale === 'en' ? 'vi' : 'en'
    router.push(`/${next}`)
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-8 font-sans dark:bg-zinc-900">
      <div className="mx-auto max-w-4xl space-y-10">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            {t('title')}
          </motion.h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            {t('subtitle')}
          </p>

          {/* Clerk auth bar */}
          <div className="mt-4 flex items-center justify-center gap-3">
            {isSignedIn ? (
              <>
                <UserButton />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Hi, <strong>{user.firstName ?? user.username}</strong>
                </span>
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Dashboard →
                </Link>
                <SignOutButton>
                  <button className="rounded-lg border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
                    Sign out
                  </button>
                </SignOutButton>
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
                  Sign in
                </button>
              </SignInButton>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Zustand Counter */}
          <Section icon={<Zap size={18} />} title={t('counter')}>
            <p className="mb-4 text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
              {t('counterValue', { count })}
            </p>
            <div className="flex gap-2">
              <IconButton onClick={decrement} variant="outline">
                <Minus size={16} />
              </IconButton>
              <IconButton onClick={increment}>
                <Plus size={16} />
              </IconButton>
              <IconButton onClick={reset} variant="ghost">
                <RotateCcw size={16} />
              </IconButton>
            </div>
          </Section>

          {/* next-intl locale switcher */}
          <Section icon={<Globe size={18} />} title="next-intl">
            <p className="mb-4 text-sm text-zinc-500">
              Active locale:{' '}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {locale}
              </span>
            </p>
            <IconButton onClick={switchLocale}>{t('switchLocale')}</IconButton>
          </Section>

          {/* React Query */}
          <Section icon={<Download size={18} />} title={t('query')}>
            <IconButton
              onClick={() => setFetchEnabled(true)}
              disabled={fetchEnabled}
            >
              {isFetching ? 'Loading…' : t('queryFetch')}
            </IconButton>
            {posts && (
              <ul className="mt-3 space-y-1">
                {posts.map((p) => (
                  <li
                    key={p.id}
                    className="truncate text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    • {p.title}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* Sonner + Framer Motion */}
          <Section icon={<Bell size={18} />} title={t('motion')}>
            <div className="flex flex-col gap-3">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <IconButton
                  className="w-full"
                  onClick={() => toast.success(t('toastSuccess'))}
                >
                  {t('clickMe')} — success toast
                </IconButton>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <IconButton
                  className="w-full"
                  variant="outline"
                  onClick={() => toast.error(t('toastError'))}
                >
                  {t('clickMe')} — error toast
                </IconButton>
              </motion.div>
            </div>
          </Section>

          {/* dayjs + currency.js */}
          <Section icon={<Globe size={18} />} title={t('datetime')}>
            <dl className="space-y-1 text-sm">
              <dt className="font-medium text-zinc-700 dark:text-zinc-300">
                dayjs — now
              </dt>
              <dd className="text-zinc-500">{dayjs().format('LLLL')}</dd>
              <dt className="mt-2 font-medium text-zinc-700 dark:text-zinc-300">
                dayjs — fromNow
              </dt>
              <dd className="text-zinc-500">
                {dayjs().subtract(3, 'hour').fromNow()}
              </dd>
              <dt className="mt-2 font-medium text-zinc-700 dark:text-zinc-300">
                currency — USD
              </dt>
              <dd className="text-zinc-500">{usd(1234567.89).format()}</dd>
              <dt className="mt-2 font-medium text-zinc-700 dark:text-zinc-300">
                currency — VND
              </dt>
              <dd className="text-zinc-500">{vnd(1234567).format()}</dd>
            </dl>
          </Section>

          {/* Conform + Zod v4 */}
          <Section icon={<Zap size={18} />} title={t('form')}>
            <form
              id={form.id}
              onSubmit={form.onSubmit}
              noValidate
              className="space-y-3"
            >
              <Field label={t('name')} error={fields.name.errors?.[0]}>
                <input
                  key={fields.name.key}
                  name={fields.name.name}
                  defaultValue={(fields.name.initialValue as string) ?? ''}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2 text-sm transition outline-none',
                    'border-zinc-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200',
                    'dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100',
                    fields.name.errors && 'border-red-400 focus:border-red-500',
                  )}
                />
              </Field>
              <Field label={t('email')} error={fields.email.errors?.[0]}>
                <input
                  key={fields.email.key}
                  name={fields.email.name}
                  type="email"
                  defaultValue={(fields.email.initialValue as string) ?? ''}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2 text-sm transition outline-none',
                    'border-zinc-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200',
                    'dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100',
                    fields.email.errors &&
                      'border-red-400 focus:border-red-500',
                  )}
                />
              </Field>
              <IconButton type="submit" className="w-full">
                {t('submit')}
              </IconButton>
            </form>
          </Section>
        </div>
      </div>
    </main>
  )
}

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        <span className="text-indigo-500">{icon}</span>
        {title}
      </div>
      {children}
    </motion.div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function IconButton({
  children,
  onClick,
  disabled,
  type = 'button',
  variant = 'primary',
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  variant?: 'primary' | 'outline' | 'ghost'
  className?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50',
        variant === 'primary' &&
          'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
        variant === 'outline' &&
          'border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950',
        variant === 'ghost' &&
          'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700',
        className,
      )}
    >
      {children}
    </button>
  )
}
