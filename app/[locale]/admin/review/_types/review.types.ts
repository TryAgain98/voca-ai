export type ExerciseType =
  | 'word-to-meaning'
  | 'meaning-to-word'
  | 'listen-to-word'

export interface ReviewVocab {
  id: string
  word: string
  meaning: string
  word_type: string | null
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

export type Exercise = MCQExercise | TypingExercise

export interface ExerciseResult {
  exercise: Exercise
  isCorrect: boolean
}

export interface ReviewSetup {
  lessonIds: string[]
  exerciseTypes: ExerciseType[]
  vocab: ReviewVocab[]
}
