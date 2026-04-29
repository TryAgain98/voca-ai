'use client'

import { Loader2, Volume2, VolumeX } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '~/lib/cn'

interface ListenButtonProps {
  isSpeaking: boolean
  isLoading: boolean
  onClick: () => void
}

export function ListenButton({
  isSpeaking,
  isLoading,
  onClick,
}: ListenButtonProps) {
  const t = useTranslations('Review')
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors',
        isSpeaking
          ? 'border-emerald-500/40 text-emerald-400'
          : 'text-muted-foreground hover:text-foreground border-white/10 hover:border-white/20',
      )}
    >
      {isLoading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : isSpeaking ? (
        <VolumeX size={12} />
      ) : (
        <Volume2 size={12} />
      )}
      {t('listenBtn')}
    </button>
  )
}
