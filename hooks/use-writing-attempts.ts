'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { writingAttemptsService } from '~/services/writing-attempts.service'

import type { WritingScoreResult } from '~/providers/ai/types'
import type { WritingAttemptInsert } from '~/types'

export function useWritingAttempts(exerciseId: string) {
  return useQuery({
    queryKey: ['writing-attempts', exerciseId],
    queryFn: () => writingAttemptsService.findByExercise(exerciseId),
    enabled: !!exerciseId,
  })
}

export function useLatestWritingAttemptsByUser(userId: string) {
  return useQuery({
    queryKey: ['writing-attempts', 'latest', userId],
    queryFn: () => writingAttemptsService.findLatestByUser(userId),
    enabled: !!userId,
  })
}

export function useSubmitWritingAttempt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      exerciseId,
      userId,
      imageUrl,
      keywords,
      userSentence,
    }: {
      exerciseId: string
      userId: string
      imageUrl: string
      keywords: string[]
      userSentence: string
    }): Promise<WritingAttemptInsert & { scoreResult: WritingScoreResult }> => {
      const res = await fetch('/api/writing-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, keywords, userSentence }),
      })
      if (!res.ok) throw new Error('Scoring failed')
      const score = (await res.json()) as WritingScoreResult

      const attempt: WritingAttemptInsert = {
        exercise_id: exerciseId,
        user_id: userId,
        user_sentence: userSentence,
        grammar_score: score.grammar_score,
        relevance_score: score.relevance_score,
        grammar_feedback: score.grammar_feedback.en,
        grammar_feedback_vi: score.grammar_feedback.vi,
        relevance_feedback: score.relevance_feedback.en,
        relevance_feedback_vi: score.relevance_feedback.vi,
        improved_sentence: score.improved_sentence,
        ideal_sentence: score.ideal_sentence,
        ideal_sentence_vi: score.ideal_sentence_vi,
      }

      await writingAttemptsService.upsert(attempt)
      return { ...attempt, scoreResult: score }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ['writing-attempts', vars.exerciseId],
      })
      qc.invalidateQueries({
        queryKey: ['writing-attempts', 'latest', vars.userId],
      })
    },
    onError: () => toast.error('Không thể chấm bài, thử lại sau'),
  })
}
