import { useEffect, useRef, useState } from 'react'

import type { VocabularyFill } from '~/providers/ai/types'

interface FillState {
  computedFor: string
  data: VocabularyFill | null
  isLoading: boolean
}

export interface WordFillData {
  meaning: string | null
  phonetic: string | null
  example: string | null
  isLoading: boolean
}

export interface UseWordFillReturn {
  fill: WordFillData
  clear: () => void
}

const DEBOUNCE_MS = 800
const MIN_LENGTH = 2
const RESET: FillState = { computedFor: '', data: null, isLoading: false }

export function useWordFill(word: string): UseWordFillReturn {
  const [state, setState] = useState<FillState>(RESET)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (word.trim().length < MIN_LENGTH) {
      abortRef.current?.abort()
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const timer = setTimeout(() => {
      setState({ computedFor: word, data: null, isLoading: true })

      void fetch('/api/suggest-vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.trim() }),
        signal: controller.signal,
      })
        .then((res) => res.json() as Promise<VocabularyFill>)
        .then((data) => setState({ computedFor: word, data, isLoading: false }))
        .catch(() => setState(RESET))
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [word])

  const isActive =
    word.trim().length >= MIN_LENGTH && state.computedFor === word
  const wordIsValid = isActive && state.data?.valid !== false

  return {
    fill: {
      meaning: wordIsValid ? state.data?.meaning || null : null,
      phonetic: wordIsValid ? state.data?.phonetic || null : null,
      example: wordIsValid ? state.data?.example || null : null,
      isLoading: isActive ? state.isLoading : false,
    },
    clear: () => setState(RESET),
  }
}
