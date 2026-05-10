import { dayjs } from '~/lib/dayjs'
import { supabase } from '~/lib/supabase'

import type {
  QuizIncorrectWord,
  QuizSession,
  QuizSessionInsert,
  Vocabulary,
} from '~/types'

const RECENT_SESSIONS_LIMIT = 10
const WEEK_DAYS = 7
const TRICKY_WORDS_LIMIT = 10

export interface TrickyWord {
  word_id: string
  word: string
  meaning: string
  word_type: string | null
  phonetic: string | null
  example: string | null
  synonyms: string[]
  wrongCount: number
}

export interface QuizPerformanceStats {
  recentAverage: number
  sessionsThisWeek: number
  recentScores: number[]
  totalSessions: number
  trickyWords: TrickyWord[]
}

class QuizSessionService {
  async create(payload: QuizSessionInsert): Promise<QuizSession> {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data as QuizSession
  }

  async findByUserId(userId: string): Promise<QuizSession[]> {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as QuizSession[]
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('quiz_sessions').delete().eq('id', id)
    if (error) throw error
  }

  async getPerformanceStats(userId: string): Promise<QuizPerformanceStats> {
    const { data: recent, error: recentError } = await supabase
      .from('quiz_sessions')
      .select('score, created_at, incorrect_words')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(RECENT_SESSIONS_LIMIT)

    if (recentError) throw recentError

    const { count, error: countError } = await supabase
      .from('quiz_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (countError) throw countError

    const rows = (recent ?? []) as Pick<
      QuizSession,
      'score' | 'created_at' | 'incorrect_words'
    >[]

    const recentScores = rows.map((r) => r.score).reverse()
    const recentAverage =
      recentScores.length > 0
        ? recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length
        : 0

    const weekAgo = dayjs().subtract(WEEK_DAYS, 'day')
    const sessionsThisWeek = rows.filter(
      (r) => !dayjs(r.created_at).isBefore(weekAgo),
    ).length

    const tally = new Map<
      string,
      { snapshot: QuizIncorrectWord; count: number }
    >()
    for (const row of rows) {
      for (const w of row.incorrect_words) {
        const entry = tally.get(w.word_id)
        if (entry) {
          entry.count += 1
        } else {
          tally.set(w.word_id, { snapshot: w, count: 1 })
        }
      }
    }

    const topIds = [...tally.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, TRICKY_WORDS_LIMIT)
      .map(([id]) => id)

    let vocabMap = new Map<string, Vocabulary>()
    if (topIds.length > 0) {
      const { data: vocabs, error: vocabError } = await supabase
        .from('vocabularies')
        .select('*')
        .in('id', topIds)
      if (vocabError) throw vocabError
      vocabMap = new Map((vocabs ?? []).map((v: Vocabulary) => [v.id, v]))
    }

    const trickyWords: TrickyWord[] = topIds.map((id) => {
      const entry = tally.get(id)!
      const vocab = vocabMap.get(id)
      return {
        word_id: id,
        word: vocab?.word ?? entry.snapshot.word,
        meaning: vocab?.meaning ?? entry.snapshot.meaning,
        word_type: vocab?.word_type ?? null,
        phonetic: vocab?.phonetic ?? null,
        example: vocab?.example ?? null,
        synonyms: vocab?.synonyms ?? [],
        wrongCount: entry.count,
      }
    })

    return {
      recentAverage,
      sessionsThisWeek,
      recentScores,
      totalSessions: count ?? 0,
      trickyWords,
    }
  }
}

export const quizSessionService = new QuizSessionService()
export type { QuizIncorrectWord, QuizSession, QuizSessionInsert }
