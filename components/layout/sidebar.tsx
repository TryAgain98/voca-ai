'use client'

import { BookMarked, BookOpen, ImagePlus, Settings } from 'lucide-react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { cn } from '~/lib/cn'

export function Sidebar() {
  const t = useTranslations('Nav')
  const pathname = usePathname()
  const params = useParams()
  const locale = params.locale as string

  const isActive = (href: string) => pathname.startsWith(`/${locale}${href}`)

  const navItems = [
    { href: '/admin/lessons', label: t('lessons'), icon: BookOpen },
    { href: '/admin/vocabularies', label: t('vocabularies'), icon: BookMarked },
    { href: '/admin/import', label: t('import'), icon: ImagePlus },
    { href: '/admin/settings', label: t('settings'), icon: Settings },
  ]

  return (
    <aside className="border-sidebar-border bg-sidebar flex h-full w-56 shrink-0 flex-col border-r">
      <div className="flex h-14 items-center px-5">
        <span className="text-base font-bold tracking-tight">Voca AI</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={`/${locale}${href}`}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              isActive(href)
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground font-medium',
            )}
          >
            <Icon size={16} strokeWidth={isActive(href) ? 2.5 : 2} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
