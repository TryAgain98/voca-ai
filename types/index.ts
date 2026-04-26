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
}
