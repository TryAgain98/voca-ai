import type {
  ExerciseResult,
  ExerciseType,
  ReviewVocab,
} from '~admin/review/_types/review.types'

export type { ExerciseType, ReviewVocab }

export interface QuizSetup {
  userId: string
  lessonIds: string[]
  exerciseTypes: ExerciseType[]
  vocab: ReviewVocab[]
}

export interface QuizExerciseResult extends ExerciseResult {
  userAnswer?: string
}

export type QuizScreen = 'setup' | 'playing' | 'results'
