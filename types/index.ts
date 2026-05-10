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
  synonyms: string[]
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface WordMastery {
  id: string
  user_id: string
  word_id: string
  level: number
  correct_count: number
  wrong_count: number
  tested_at: string | null
  due_at: string | null
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
  progress: WordMastery | null
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

export interface UserStreak {
  user_id: string
  current_streak: number
  longest_streak: number
  last_active_date: string | null
  freezes_remaining: number
  freezes_replenished_at: string
  email: string | null
  timezone: string
  reminder_hour: number
  email_reminders_enabled: boolean
  last_reminder_sent_at: string | null
  created_at: string
  updated_at: string
}

export interface StreakReminderPrefs {
  email_reminders_enabled: boolean
  email: string
  timezone: string
  reminder_hour: number
}
