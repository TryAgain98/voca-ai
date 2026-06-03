import { createContext, useContext } from 'react'

export interface PassageWordDetail {
  meaning: string | null
  ipa: string | null
  wordType: string | null
  example: string | null
  synonyms: string[]
  description: string | null
  source: 'db' | 'ai'
}

export interface PassageLookupState {
  detailMap: Map<string, PassageWordDetail>
  isLoading: boolean
}

export const PassageLookupContext = createContext<PassageLookupState>({
  detailMap: new Map(),
  isLoading: false,
})

export function useWordLookup(): PassageLookupState {
  return useContext(PassageLookupContext)
}
