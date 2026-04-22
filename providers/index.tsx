'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

import { NProgressProvider } from './nprogress-provider'
import { QueryProvider } from './query-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>
        <NProgressProvider />
        {children}
        <Toaster richColors position="top-right" />
      </QueryProvider>
    </ThemeProvider>
  )
}
