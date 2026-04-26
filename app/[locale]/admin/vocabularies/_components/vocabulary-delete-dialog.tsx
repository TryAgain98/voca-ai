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

import type { Vocabulary } from '~/types'

interface VocabularyDeleteDialogProps {
  voca: Vocabulary | null
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function VocabularyDeleteDialog({
  voca,
  isPending,
  onConfirm,
  onCancel,
}: VocabularyDeleteDialogProps) {
  const t = useTranslations('Vocabularies')
  const tCommon = useTranslations('Common')

  return (
    <Dialog open={!!voca} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('deleteTitle')}</DialogTitle>
          <DialogDescription>
            {t('deleteDescription', { word: voca?.word ?? '' })}
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
