'use client'

import {
  BookMarked,
  BookOpen,
  BrainCircuit,
  GraduationCap,
  ImagePlus,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Trophy,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { cn } from '~/lib/cn'

import { AppLogo } from './app-logo'

interface SidebarProps {
  onClose?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({
  onClose,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const t = useTranslations('Nav')
  const pathname = usePathname()
  const params = useParams()
  const locale = params.locale as string

  const isActive = (href: string) => pathname.startsWith(`/${locale}${href}`)

  const navItems = [
    { href: '/admin/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/admin/lessons', label: t('lessons'), icon: BookOpen },
    { href: '/admin/vocabularies', label: t('vocabularies'), icon: BookMarked },
    { href: '/admin/import', label: t('import'), icon: ImagePlus },
    { href: '/admin/review', label: t('review'), icon: GraduationCap },
    { href: '/admin/quiz', label: t('quiz'), icon: BrainCircuit },
    { href: '/admin/users', label: t('users'), icon: Trophy },
    { href: '/admin/settings', label: t('settings'), icon: Settings },
  ]

  return (
    <aside
      className={cn(
        'border-sidebar-border bg-sidebar flex h-full shrink-0 flex-col border-r transition-[width] duration-200',
        isCollapsed ? 'w-14' : 'w-56',
      )}
    >
      <div className="flex h-14 items-center gap-2 px-3">
        <AppLogo showText={!isCollapsed} />

        <div className="ml-auto flex items-center">
          {onToggleCollapse && (
            <button
              className="hover:bg-sidebar-accent hidden rounded-md p-1.5 lg:flex"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen size={16} />
              ) : (
                <PanelLeftClose size={16} />
              )}
            </button>
          )}
          {onClose && (
            <button
              className="hover:bg-sidebar-accent rounded-md p-1.5 lg:hidden"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <nav
        className={cn('flex-1 space-y-0.5 py-2', isCollapsed ? 'px-2' : 'px-3')}
      >
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={`/${locale}${href}`}
            onClick={onClose}
            title={isCollapsed ? label : undefined}
            className={cn(
              'flex items-center rounded-md py-2 text-sm transition-colors',
              isCollapsed ? 'justify-center px-2' : 'gap-3 px-3',
              isActive(href)
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground font-medium',
            )}
          >
            <Icon size={16} strokeWidth={isActive(href) ? 2.5 : 2} />
            {!isCollapsed && label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
