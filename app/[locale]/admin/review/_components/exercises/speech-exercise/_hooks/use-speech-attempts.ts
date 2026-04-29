'use client'

import { useCallback, useState } from 'react'

const MAX_ATTEMPTS = 3

interface UseSpeechAttemptsReturn {
  attempts: number
  canBypass: boolean
  incrementAttempts: () => void
  resetAttempts: () => void
}

export function useSpeechAttempts(): UseSpeechAttemptsReturn {
  const [attempts, setAttempts] = useState(0)

  const incrementAttempts = useCallback(() => {
    setAttempts((prev) => prev + 1)
  }, [])

  const resetAttempts = useCallback(() => {
    setAttempts(0)
  }, [])

  return {
    attempts,
    canBypass: attempts >= MAX_ATTEMPTS,
    incrementAttempts,
    resetAttempts,
  }
}
