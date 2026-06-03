import { supabase } from '~/lib/supabase'

import type {
  StoryActivityProgress,
  StoryActivityType,
  StoryGenre,
  StorySession,
  StorySessionWithProgress,
  StoryWord,
} from '~/types'

class StorySessionService {
  async findTodaySession(
    userId: string,
  ): Promise<StorySessionWithProgress | null> {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('story_sessions')
      .select('*, story_activity_progress(*)')
      .eq('user_id', userId)
      .eq('session_date', today)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    return {
      ...(data as StorySession),
      activities: (data.story_activity_progress ??
        []) as StoryActivityProgress[],
    }
  }

  async createSession(
    userId: string,
    genre: StoryGenre,
    passageText: string,
    translation: string,
    wrongWords: StoryWord[],
  ): Promise<StorySessionWithProgress> {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('story_sessions')
      .insert({
        user_id: userId,
        session_date: today,
        genre,
        passage_text: passageText,
        translation,
        wrong_words: wrongWords,
        status: 'active',
      })
      .select()
      .single()
    if (error) throw error

    const activities: StoryActivityProgress[] = []
    const types: StoryActivityType[] = ['read', 'quiz', 'type']
    for (const activity_type of types) {
      const { data: act, error: actErr } = await supabase
        .from('story_activity_progress')
        .insert({
          story_session_id: data.id,
          activity_type,
          is_complete: false,
        })
        .select()
        .single()
      if (actErr) throw actErr
      activities.push(act as StoryActivityProgress)
    }

    return { ...(data as StorySession), activities }
  }

  async completeActivity(
    sessionId: string,
    activityType: StoryActivityType,
  ): Promise<void> {
    const { error } = await supabase
      .from('story_activity_progress')
      .update({
        is_complete: true,
        completed_at: new Date().toISOString(),
      })
      .eq('story_session_id', sessionId)
      .eq('activity_type', activityType)
    if (error) throw error
  }

  async completeSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('story_sessions')
      .update({ status: 'complete' })
      .eq('id', sessionId)
    if (error) throw error
  }

  async deleteSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('story_sessions')
      .delete()
      .eq('id', sessionId)
    if (error) throw error
  }

  async countCompletedSessions(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('story_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'complete')
    if (error) throw error
    return count ?? 0
  }
}

export const storySessionService = new StorySessionService()
