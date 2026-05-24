'use client'

import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

import type { Passage } from '~/types'

interface PassageDeleteDialogProps {
  passage: Passage | null
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function PassageDeleteDialog({
  passage,
  isPending,
  onConfirm,
  onCancel,
}: PassageDeleteDialogProps) {
  const t = useTranslations('Passages')
  const tCommon = useTranslations('Common')

  return (
    <Dialog open={!!passage} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('deleteTitle')}</DialogTitle>
          <DialogDescription>
            {t('deleteDescription', { title: passage?.title ?? '' })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {tCommon('cancel')}
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? tCommon('deleting') : tCommon('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
