export type ExerciseType =
  | 'word-to-meaning'
  | 'meaning-to-word'
  | 'listen-to-word'
  | 'speak-word'

export interface ReviewVocab {
  id: string
  word: string
  meaning: string
  word_type: string | null
  phonetic?: string | null
  example?: string | null
  synonyms: string[]
}

export interface MCQExercise {
  type: 'word-to-meaning'
  vocab: ReviewVocab
  options: string[]
  correctIndex: number
  isReinforcement: boolean
}

export interface TypingExercise {
  type: 'meaning-to-word' | 'listen-to-word'
  vocab: ReviewVocab
  siblings: ReviewVocab[]
  isReinforcement: boolean
}

export interface SpeakExercise {
  type: 'speak-word'
  vocab: ReviewVocab
  isReinforcement: boolean
}

export type Exercise = MCQExercise | TypingExercise | SpeakExercise

export interface AnswerMeta {
  userAnswer?: string
  responseMs?: number
  usedHint?: boolean
  answerCorrect?: boolean
  acceptedSiblingId?: string
}

export type AnswerHandler = (isCorrect: boolean, meta?: AnswerMeta) => void

export interface ExerciseResult {
  exercise: Exercise
  isCorrect: boolean
  responseMs?: number
  usedHint?: boolean
  answerCorrect?: boolean
}

export interface ReviewSetup {
  userId: string
  lessonIds: string[]
  exerciseTypes: ExerciseType[]
  vocab: ReviewVocab[]
}
