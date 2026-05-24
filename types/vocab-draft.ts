export type DraftStatus = 'new' | 'duplicate' | 'modified'

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
  _dbSnapshot?: Omit<
    DraftVocabulary,
    '_id' | '_dbId' | 'status' | '_dbSnapshot'
  >
}
