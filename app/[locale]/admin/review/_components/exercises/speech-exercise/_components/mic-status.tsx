'use client'

import { Mic } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '~/lib/cn'

interface MicStatusProps {
  status: string
}

export function MicStatus({ status }: MicStatusProps) {
  const t = useTranslations('Review')
  if (status === 'idle' || status === 'done') return null
  return (
    <div className="flex items-center justify-center gap-2 py-1">
      <Mic
        size={15}
        className={cn(
          status === 'listening' && 'animate-pulse text-red-400',
          status === 'error' && 'text-muted-foreground',
        )}
      />
      <span className="text-muted-foreground text-sm">
        {status === 'listening' && t('listeningLabel')}
        {status === 'error' && t('speakError')}
      </span>
    </div>
  )
}
