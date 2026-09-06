'use client'

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
} from '~/components/ui/alert-dialog'

import type { DailyTask } from '~/types'

interface TaskDeleteDialogProps {
  task: DailyTask | null
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function TaskDeleteDialog({
  task,
  isPending,
  onConfirm,
  onCancel,
}: TaskDeleteDialogProps) {
  const t = useTranslations('Daily')
  const tc = useTranslations('Common')

  return (
    <AlertDialog open={!!task}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('deleteBody')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isPending}>
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {tc('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
