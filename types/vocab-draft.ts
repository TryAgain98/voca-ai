export type DraftStatus = 'new' | 'duplicate' | 'conflict'

export type ConflictAction = 'create_new' | 'update_existing'

export interface ConflictEntry {
  id: string
  meaning: string
}

export interface DraftVocabulary {
  _id: string
  _dbId?: string
  word: string
  word_type: string
  phonetic: string
  meaning: string
  example: string
  description: string
  status?: DraftStatus
  conflictAction?: ConflictAction
  _dbConflicts?: ConflictEntry[]
}
