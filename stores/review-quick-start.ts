import { create } from 'zustand'

import type { ReviewVocab } from '~admin/review/_types/review.types'

interface ReviewQuickStartState {
  pendingVocab: ReviewVocab[] | null
  setPendingVocab: (vocab: ReviewVocab[]) => void
  clearPendingVocab: () => void
}

export const useReviewQuickStartStore = create<ReviewQuickStartState>(
  (set) => ({
    pendingVocab: null,
    setPendingVocab: (vocab) => set({ pendingVocab: vocab }),
    clearPendingVocab: () => set({ pendingVocab: null }),
  }),
)
