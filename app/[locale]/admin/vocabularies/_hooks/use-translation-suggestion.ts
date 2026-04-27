import { useEffect, useRef, useState } from 'react'

type Direction = 'word-to-meaning' | 'meaning-to-word'

interface SuggestionState {
  computedFor: string
  suggestion: string | null
  isLoading: boolean
}

interface UseSuggestionReturn {
  suggestion: string | null
  isLoading: boolean
  clear: () => void
}

const DEBOUNCE_MS = 650
const MIN_LENGTH = 2
const RESET: SuggestionState = {
  computedFor: '',
  suggestion: null,
  isLoading: false,
}

export function useTranslationSuggestion(
  text: string,
  direction: Direction,
  enabled: boolean,
): UseSuggestionReturn {
  const [state, setState] = useState<SuggestionState>(RESET)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!enabled || text.trim().length < MIN_LENGTH) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    // All setState calls are inside async callbacks — no sync setState in effect body
    const timer = setTimeout(() => {
      setState({ computedFor: text, suggestion: null, isLoading: true })

      void fetch('/api/suggest-translation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), direction }),
        signal: controller.signal,
      })
        .then((res) => res.json() as Promise<{ suggestion?: string }>)
        .then((data) =>
          setState({
            computedFor: text,
            suggestion: data.suggestion ?? null,
            isLoading: false,
          }),
        )
        .catch(() => setState(RESET))
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [text, direction, enabled])

  // Only expose suggestion/loading when it was computed for the current text
  // and the feature is still enabled — avoids stale suggestions
  const isValid =
    enabled && text.trim().length >= MIN_LENGTH && state.computedFor === text

  return {
    suggestion: isValid ? state.suggestion : null,
    isLoading: isValid ? state.isLoading : false,
    clear: () => setState(RESET),
  }
}
