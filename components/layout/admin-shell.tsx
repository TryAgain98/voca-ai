'use client'

import { Menu } from 'lucide-react'
import { useState } from 'react'

import { cn } from '~/lib/cn'

import { LocaleSwitcher } from './locale-switcher'
import { Sidebar } from './sidebar'
import { ThemeToggle } from './theme-toggle'
import { UserButtonClient } from './user-button-client'

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 transition-transform duration-200 lg:relative lg:z-auto lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="border-border bg-background flex h-14 shrink-0 items-center gap-2 border-b px-4 sm:px-5">
          <button
            className="hover:bg-accent rounded-md p-1.5 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <LocaleSwitcher />
          <ThemeToggle />
          <UserButtonClient />
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
