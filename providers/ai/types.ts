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
  suggested_vocabulary: SuggestedPassageVocab[]
}

export interface WritingLocalizedText {
  en: string
  vi: string
}

export interface WritingScoreResult {
  grammar_score: number
  grammar_feedback: WritingLocalizedText
  relevance_score: number
  relevance_feedback: WritingLocalizedText
  improved_sentence: string
  ideal_sentence: string
  ideal_sentence_vi: string
}

export interface WordLookup {
  meaning: string | null
  ipa: string | null
}

export type PassageWordMap = Record<string, WordLookup>
