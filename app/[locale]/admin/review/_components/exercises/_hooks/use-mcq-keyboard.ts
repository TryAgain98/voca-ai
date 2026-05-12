'use client'

import { useEffect, useRef, useState } from 'react'

const COLS = 2

interface UseMCQKeyboardOptions {
  optionCount: number
  selected: number | null
  onSelect: (idx: number) => void
  exerciseId: string
}

export function useMCQKeyboard({
  optionCount,
  selected,
  onSelect,
  exerciseId,
}: UseMCQKeyboardOptions): number {
  const [focusedIdx, setFocusedIdx] = useState(0)
  const [trackedId, setTrackedId] = useState(exerciseId)
  const onSelectRef = useRef<(idx: number) => void>(onSelect)

  useEffect(() => {
    onSelectRef.current = onSelect
  })

  if (trackedId !== exerciseId) {
    setTrackedId(exerciseId)
    setFocusedIdx(0)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selected !== null) return

      const col = focusedIdx % COLS
      const row = Math.floor(focusedIdx / COLS)
      const totalRows = Math.ceil(optionCount / COLS)

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          if (col < COLS - 1 && focusedIdx + 1 < optionCount)
            setFocusedIdx(focusedIdx + 1)
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (col > 0) setFocusedIdx(focusedIdx - 1)
          break
        case 'ArrowDown':
          e.preventDefault()
          if (row < totalRows - 1 && focusedIdx + COLS < optionCount)
            setFocusedIdx(focusedIdx + COLS)
          break
        case 'ArrowUp':
          e.preventDefault()
          if (row > 0) setFocusedIdx(focusedIdx - COLS)
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          onSelectRef.current(focusedIdx)
          break
        case '1':
        case '2':
        case '3':
        case '4': {
          const numIdx = Number(e.key) - 1
          if (numIdx < optionCount) {
            e.preventDefault()
            setFocusedIdx(numIdx)
            onSelectRef.current(numIdx)
          }
          break
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selected, focusedIdx, optionCount])

  return focusedIdx
}
