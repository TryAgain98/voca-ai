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
  isReinforcement: boolean
}

export interface SpeakExercise {
  type: 'speak-word'
  vocab: ReviewVocab
  isReinforcement: boolean
}

export type Exercise = MCQExercise | TypingExercise | SpeakExercise

export interface ExerciseResult {
  exercise: Exercise
  isCorrect: boolean
}

export interface ReviewSetup {
  userId: string
  lessonIds: string[]
  exerciseTypes: ExerciseType[]
  vocab: ReviewVocab[]
}
