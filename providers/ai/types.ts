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

export interface PassageSegment {
  id: string
  text: string
}

export type WordPos =
  | 'n'
  | 'v'
  | 'adj'
  | 'adv'
  | 'prep'
  | 'conj'
  | 'pron'
  | 'det'
  | 'other'

export interface WordTag {
  word: string
  pos: WordPos
  token_index: number
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
  summary: string
  time_good: number
  time_ok: number
  time_acceptable: number
  segments: PassageSegment[]
  word_tags: WordTag[]
  suggested_vocabulary: SuggestedPassageVocab[]
}
