export type QuizMode = 'multiple-choice' | 'matching'
export type QuizScreen = 'setup' | 'playing' | 'results'

export interface QuizVocab {
  id: string
  word: string
  meaning: string
}

export interface MCQuestion {
  vocab: QuizVocab
  options: string[]
  correctIndex: number
}

export interface MCResult {
  question: MCQuestion
  selectedIndex: number | null
  isCorrect: boolean
}

export interface MatchPair {
  id: string
  word: string
  meaning: string
  isMatched: boolean
}

export interface QuizSetup {
  lessonId: string
  mode: QuizMode
  vocab: QuizVocab[]
}
