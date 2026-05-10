export interface ExtractedVocabulary {
  word: string
  word_type: string
  phonetic: string
  meaning: string
  example: string
  description: string
}

export type TranslationDirection = 'word-to-meaning' | 'meaning-to-word'

export interface VocabularyFill {
  valid: boolean
  word_type?: string
  meaning: string
  phonetic: string
  example: string
}
