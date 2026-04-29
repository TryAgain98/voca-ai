'use client'

import { Mic } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'

interface SpeakButtonProps {
  isTTSActive: boolean
  onClick: () => void
}

export function SpeakButton({ isTTSActive, onClick }: SpeakButtonProps) {
  const t = useTranslations('Review')
  return (
    <Button
      onClick={onClick}
      disabled={isTTSActive}
      variant="outline"
      className="flex h-12 w-full items-center gap-2 rounded-xl border-white/10"
    >
      <Mic size={16} />
      {t('speakBtn')}
    </Button>
  )
}
