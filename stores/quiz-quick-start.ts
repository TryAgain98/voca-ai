import { create } from 'zustand'

import type { ReviewVocab } from '~admin/review/_types/review.types'

interface QuizQuickStartState {
  pendingVocab: ReviewVocab[] | null
  setPendingVocab: (vocab: ReviewVocab[]) => void
  clearPendingVocab: () => void
}

export const useQuizQuickStartStore = create<QuizQuickStartState>((set) => ({
  pendingVocab: null,
  setPendingVocab: (vocab) => set({ pendingVocab: vocab }),
  clearPendingVocab: () => set({ pendingVocab: null }),
}))
