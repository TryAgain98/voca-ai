import type {
  ExerciseResult,
  ExerciseType,
  ReviewVocab,
} from '~admin/review/_types/review.types'

export type { ExerciseType, ReviewVocab }

// speak-word disabled: speech recognition isn't reliable enough to score mastery fairly.
// listen-to-word disabled: too easy to be a meaningful test.
export const QUIZ_EXERCISE_TYPES: ExerciseType[] = ['meaning-to-word']

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
