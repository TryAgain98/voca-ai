'use client'

import { Loader2, Volume2, VolumeX } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { useTTS } from '~/hooks/use-tts'
import { cn } from '~/lib/cn'

interface SpeakButtonProps {
  text: string
  className?: string
}

export function SpeakButton({ text, className }: SpeakButtonProps) {
  const { speak, isSpeaking, isLoading } = useTTS(text)

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      title={isSpeaking ? 'Dừng' : 'Nghe phát âm'}
      className={cn(isSpeaking && 'text-primary', className)}
      onClick={(e) => {
        e.stopPropagation()
        speak()
      }}
    >
      {isLoading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : isSpeaking ? (
        <VolumeX size={14} />
      ) : (
        <Volume2 size={14} />
      )}
    </Button>
  )
}
