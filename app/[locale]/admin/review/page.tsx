'use client'

import { useUser } from '@clerk/nextjs'
import { useState } from 'react'

import { useReviewQuickStartStore } from '~/stores/review-quick-start'

import { ReviewSessionView } from './_components/review-session'
import { ReviewSetup } from './_components/review-setup'

import type { ReviewSetup as ReviewSetupType } from './_types/review.types'

const ALL_EXERCISE_TYPES = ['word-to-meaning', 'meaning-to-word'] as const

export default function ReviewPage() {
  const { user } = useUser()
  const [manualSetup, setManualSetup] = useState<ReviewSetupType | null>(null)
  const [sessionKey, setSessionKey] = useState(0)
  const { pendingVocab, clearPendingVocab } = useReviewQuickStartStore()

  const quickStartSetup: ReviewSetupType | null =
    pendingVocab && pendingVocab.length >= 4 && user?.id
      ? {
          userId: user.id,
          lessonIds: [],
          exerciseTypes: [...ALL_EXERCISE_TYPES],
          vocab: pendingVocab,
        }
      : null

  const setup = manualSetup ?? quickStartSetup

  const handleExit = () => {
    setManualSetup(null)
    clearPendingVocab()
    setSessionKey((k) => k + 1)
  }

  if (!setup) {
    return <ReviewSetup onStart={setManualSetup} />
  }

  return (
    <ReviewSessionView key={sessionKey} setup={setup} onExit={handleExit} />
  )
}
