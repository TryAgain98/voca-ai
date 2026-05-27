import { create } from 'zustand'

import type {
  ExerciseType,
  ReviewVocab,
} from '~admin/review/_types/review.types'

interface ReviewQuickStartState {
  pendingVocab: ReviewVocab[] | null
  pendingExerciseTypes: ExerciseType[] | null
  setPendingVocab: (
    vocab: ReviewVocab[],
    exerciseTypes?: ExerciseType[],
  ) => void
  clearPendingVocab: () => void
}

export const useReviewQuickStartStore = create<ReviewQuickStartState>(
  (set) => ({
    pendingVocab: null,
    pendingExerciseTypes: null,
    setPendingVocab: (vocab, exerciseTypes) =>
      set({ pendingVocab: vocab, pendingExerciseTypes: exerciseTypes ?? null }),
    clearPendingVocab: () =>
      set({ pendingVocab: null, pendingExerciseTypes: null }),
  }),
)
