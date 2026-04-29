'use client'

import { useState } from 'react'

import { ReviewSessionView } from './_components/review-session'
import { ReviewSetup } from './_components/review-setup'

import type { ReviewSetup as ReviewSetupType } from './_types/review.types'

export default function ReviewPage() {
  const [setup, setSetup] = useState<ReviewSetupType | null>(null)
  const [sessionKey, setSessionKey] = useState(0)

  if (!setup) {
    return <ReviewSetup onStart={setSetup} />
  }

  return (
    <ReviewSessionView
      key={sessionKey}
      setup={setup}
      onExit={() => {
        setSetup(null)
        setSessionKey((k) => k + 1)
      }}
    />
  )
}
