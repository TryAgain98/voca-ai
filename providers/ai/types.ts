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

export interface SuggestedPassageVocab {
  word: string
  word_type: string
  phonetic: string
  meaning: string
  example: string
  description: string
}

export interface PassageAnalysis {
  content: string
  title: string
  translation: string
  time_good: number
  time_ok: number
  time_acceptable: number
  suggested_vocabulary: SuggestedPassageVocab[]
}
