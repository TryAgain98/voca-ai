'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

import { useReviewQuickStartStore } from '~/stores/review-quick-start'

import { ReviewSessionView } from './_components/review-session'
import { ReviewSetup } from './_components/review-setup'

import type {
  ReviewSetup as ReviewSetupType,
  ReviewVocab,
} from './_types/review.types'

const DEFAULT_EXERCISE_TYPES = ['word-to-meaning', 'meaning-to-word'] as const

export default function ReviewPage() {
  const { user } = useUser()
  const [manualSetup, setManualSetup] = useState<ReviewSetupType | null>(null)
  const [sessionKey, setSessionKey] = useState(0)
  const clearPendingVocab = useReviewQuickStartStore((s) => s.clearPendingVocab)

  const [quickStartVocab, setQuickStartVocab] = useState<ReviewVocab[] | null>(
    () => useReviewQuickStartStore.getState().pendingVocab,
  )
  const [quickStartExerciseTypes, setQuickStartExerciseTypes] = useState(
    () => useReviewQuickStartStore.getState().pendingExerciseTypes,
  )

  useEffect(() => {
    if (quickStartVocab) {
      clearPendingVocab()
    }
  }, [quickStartVocab, clearPendingVocab])

  const quickStartSetup: ReviewSetupType | null =
    quickStartVocab && quickStartVocab.length >= 4 && user?.id
      ? {
          userId: user.id,
          lessonIds: [],
          exerciseTypes: quickStartExerciseTypes ?? [...DEFAULT_EXERCISE_TYPES],
          vocab: quickStartVocab,
        }
      : null

  const setup = manualSetup ?? quickStartSetup

  const handleExit = () => {
    setManualSetup(null)
    setQuickStartVocab(null)
    setQuickStartExerciseTypes(null)
    setSessionKey((k) => k + 1)
  }

  if (!setup) {
    return <ReviewSetup onStart={setManualSetup} />
  }

  return (
    <ReviewSessionView key={sessionKey} setup={setup} onExit={handleExit} />
  )
}
