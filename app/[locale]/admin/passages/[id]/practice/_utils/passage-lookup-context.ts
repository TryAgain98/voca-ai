import { createContext, useContext } from 'react'

import type { WordLookup } from '~/providers/ai'

export interface PassageLookupState {
  wordMap: Map<string, WordLookup>
  isLoading: boolean
}

export const PassageLookupContext = createContext<PassageLookupState>({
  wordMap: new Map(),
  isLoading: false,
})

export function useWordLookup(): PassageLookupState {
  return useContext(PassageLookupContext)
}
