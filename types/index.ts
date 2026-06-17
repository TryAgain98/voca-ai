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
  created_at: string
  updated_at: string
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
  max_level: number
  correct_count: number
  wrong_count: number
  tested_at: string | null
  due_at: string | null
  last_grade: number | null
  created_at: string
  updated_at: string
}

export interface ReviewWord extends Vocabulary {
  progress: WordMastery | null
  score: number
}

export type MasteryStatus = 'mastered' | 'practicing' | 'untested'

export interface VocabWithMastery extends Vocabulary {
  mastery: WordMastery | null
  masteryStatus: MasteryStatus
}

export interface QuizIncorrectWord {
  word_id: string
  word: string
  meaning: string
  user_answer: string
  correct_answer: string
  answer_diff?: QuizAnswerDiffOp[]
}

export type QuizAnswerDiffOpType = 'match' | 'wrong' | 'missing' | 'extra'

export interface QuizAnswerDiffOp {
  type: QuizAnswerDiffOpType
  char: string
  expected_char?: string
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

export interface PassageSegment {
  id: string
  text: string
}

export interface Passage {
  id: string
  created_by: string
  title: string
  content: string
  translation: string | null
  time_good: number | null
  time_ok: number | null
  time_acceptable: number | null
  created_at: string
  updated_at: string
}

export type PassageInsert = Omit<Passage, 'id' | 'created_at' | 'updated_at'>

export interface WordResult {
  word: string
  expected: string
  got: string
  score: number
}

export interface PassageSession {
  id: string
  passage_id: string
  user_id: string
  mode: 'practice' | 'exam'
  transcript: string | null
  overall_score: number | null
  pronunciation_score: number | null
  fluency_score: number | null
  word_results: WordResult[]
  duration_seconds: number | null
  created_at: string
}

export type PassageSessionInsert = Omit<PassageSession, 'id' | 'created_at'>

export type StoryGenre =
  | 'horror'
  | 'romance'
  | 'anime'
  | 'comedy'
  | 'drama'
  | 'scifi'
  | 'detective'
  | 'adventure'

export type StoryActivityType = 'read' | 'quiz' | 'type'

export interface StoryWord {
  id: string
  word: string
  meaning: string
  phonetic?: string | null
  word_type?: string | null
  example?: string | null
  synonyms?: string[]
  description?: string | null
}

export interface StorySession {
  id: string
  user_id: string
  session_date: string
  genre: StoryGenre
  passage_text: string
  translation: string
  wrong_words: StoryWord[]
  status: 'active' | 'complete'
  created_at: string
}

export type StorySessionInsert = Omit<StorySession, 'id' | 'created_at'>

export interface StoryActivityProgress {
  id: string
  story_session_id: string
  activity_type: StoryActivityType
  is_complete: boolean
  completed_at: string | null
}

export interface StorySessionWithProgress extends StorySession {
  activities: StoryActivityProgress[]
}

export interface WritingExercise {
  id: string
  created_by: string
  title: string
  image_url: string
  keywords: string[]
  created_at: string
  updated_at: string
}

export type WritingExerciseInsert = Omit<
  WritingExercise,
  'id' | 'created_at' | 'updated_at'
>
export type WritingExerciseUpdate = Partial<
  Omit<WritingExercise, 'id' | 'created_at' | 'updated_at' | 'created_by'>
>

export interface WritingAttempt {
  id: string
  exercise_id: string
  user_id: string
  user_sentence: string
  grammar_score: number
  relevance_score: number
  grammar_feedback: string
  grammar_feedback_vi: string | null
  relevance_feedback: string
  relevance_feedback_vi: string | null
  improved_sentence: string
  ideal_sentence: string
  ideal_sentence_vi: string | null
  created_at: string
}

export type WritingAttemptInsert = Omit<WritingAttempt, 'id' | 'created_at'>

export interface AppErrorLog {
  id: string
  user_id: string | null
  source: string
  action: string
  message: string
  name: string | null
  stack: string | null
  details: Record<string, unknown>
  url: string | null
  user_agent: string | null
  created_at: string
}

export type AppErrorLogInsert = Omit<AppErrorLog, 'id' | 'created_at'>
