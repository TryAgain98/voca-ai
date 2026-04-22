'use client'

import { BookOpen, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

import { cn } from '~/lib/cn'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/lessons', label: 'Lessons', icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()
  const params = useParams()
  const locale = params.locale as string

  const isActive = (href: string) => {
    const full = `/${locale}${href}`
    if (href === '/dashboard') return pathname === full
    return pathname.startsWith(full)
  }

  return (
    <aside className="border-sidebar-border bg-sidebar flex h-full w-60 shrink-0 flex-col border-r">
      <div className="flex h-16 items-center px-6">
        <span className="text-primary text-lg font-bold">Voca AI</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={`/${locale}${href}`}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive(href)
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
