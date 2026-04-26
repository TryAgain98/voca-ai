'use client'

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
  return (
    <Dialog open={!!voca} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Vocabulary</DialogTitle>
          <DialogDescription>
            Delete &quot;{voca?.word}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
