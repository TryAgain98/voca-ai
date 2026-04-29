'use client'

import { Menu } from 'lucide-react'
import { useState } from 'react'

import { cn } from '~/lib/cn'

import { AppLogo } from './app-logo'
import { LocaleSwitcher } from './locale-switcher'
import { Sidebar } from './sidebar'
import { ThemeToggle } from './theme-toggle'
import { UserButtonClient } from './user-button-client'

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 right-0 z-30 transition-transform duration-200 lg:relative lg:inset-y-auto lg:right-auto lg:z-auto lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <Sidebar
          onClose={() => setIsMobileOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="border-border bg-background flex h-14 shrink-0 items-center gap-2 border-b px-4 sm:px-5">
          <div className="flex items-center gap-2 lg:hidden">
            <AppLogo />
          </div>

          <div className="flex-1" />
          <LocaleSwitcher />
          <ThemeToggle />
          <UserButtonClient />
          <button
            className="hover:bg-accent rounded-md p-1.5 lg:hidden"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
