export interface Post {
  id: number
  title: string
  body: string
  userId: number
}

export interface Lesson {
  id: string
  name: string
  description: string | null
}

export interface Vocabulary {
  id: string
  lesson_id: string
  word: string
  meaning: string
  example: string | null
  word_type: string | null
  phonetic: string | null
  description: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface WordReviewProgress {
  id: string
  user_id: string
  word_id: string
  level: number
  correct_count: number
  wrong_count: number
  last_review_at: string | null
  next_review_at: string
  mastery_level: number
  test_correct_count: number
  test_wrong_count: number
  last_test_at: string | null
  next_test_due_at: string | null
  ease_factor: number
  stability: number
  difficulty: number
  lapse_count: number
  is_relearning: boolean
  relearning_step: number
  last_grade: number | null
  last_response_ms: number | null
  created_at: string
  updated_at: string
}

export interface ReviewWord extends Vocabulary {
  progress: WordReviewProgress | null
  score: number
}

export interface QuizIncorrectWord {
  word_id: string
  word: string
  meaning: string
  user_answer: string
  correct_answer: string
}

export interface QuizSession {
  id: string
  user_id: string
  lesson_ids: string[]
  start_time: string
  end_time: string
  total_questions: number
  correct_count: number
  score: number
  incorrect_words: QuizIncorrectWord[]
  created_at: string
}

export type QuizSessionInsert = Omit<QuizSession, 'id' | 'created_at'>
