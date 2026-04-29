'use client'

import { RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'

interface ExitConfirmDialogProps {
  onConfirm: () => void
}

export function ExitConfirmDialog({ onConfirm }: ExitConfirmDialogProps) {
  const t = useTranslations('Review')

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1.5 px-2 text-xs"
          />
        }
      >
        <RotateCcw size={11} />
        {t('changeSetup')}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('exitConfirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('exitConfirmDesc')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('exitConfirmCancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t('exitConfirmOk')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
