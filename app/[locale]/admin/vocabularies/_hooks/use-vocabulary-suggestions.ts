import { useTranslationSuggestion } from '~/app/[locale]/admin/vocabularies/_hooks/use-translation-suggestion'

import type { UseSuggestionReturn } from '~/app/[locale]/admin/vocabularies/_hooks/use-translation-suggestion'

export interface VocabularySuggestions {
  wordToMeaning: UseSuggestionReturn
  meaningToWord: UseSuggestionReturn
}

export function useVocabularySuggestions(
  word: string,
  meaning: string,
): VocabularySuggestions {
  const wordToMeaning = useTranslationSuggestion(
    word,
    'word-to-meaning',
    meaning.trim().length === 0,
  )
  const meaningToWord = useTranslationSuggestion(
    meaning,
    'meaning-to-word',
    word.trim().length === 0,
  )
  return { wordToMeaning, meaningToWord }
}
