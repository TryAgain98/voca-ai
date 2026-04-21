'use client'

import { Toaster } from 'sonner'

import { NProgressProvider } from './nprogress-provider'
import { QueryProvider } from './query-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <NProgressProvider />
      {children}
      <Toaster richColors position="top-right" />
    </QueryProvider>
  )
}
