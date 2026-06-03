import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { storySessionService } from '~/services/story-session.service'

import type { StoryActivityType, StoryGenre, StoryWord } from '~/types'

const QUERY_KEY = 'story-session'

export function useTodayStorySession(userId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'today', userId],
    queryFn: () => storySessionService.findTodaySession(userId),
    enabled: !!userId,
    staleTime: 0,
  })
}

interface UseCreateStorySessionParams {
  userId: string
  locale: string
}

export function useCreateStorySession({
  userId,
  locale,
}: UseCreateStorySessionParams) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async ({
      genre,
      wrongWords,
    }: {
      genre: StoryGenre
      wrongWords: StoryWord[]
    }) => {
      const existing = await storySessionService.findTodaySession(userId)
      if (existing) {
        await storySessionService.deleteSession(existing.id)
      }

      const res = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre,
          words: wrongWords.map((w) => ({ word: w.word, meaning: w.meaning })),
        }),
      })
      if (!res.ok) throw new Error('Failed to generate passage')
      const { passage, translation } = (await res.json()) as {
        passage: string
        translation: string
      }

      return storySessionService.createSession(
        userId,
        genre,
        passage,
        translation,
        wrongWords,
      )
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'today', userId] })
      router.push(`/${locale}/admin/story-session/${session.id}`)
    },
    onError: () => {
      toast.error('Không thể tạo đoạn văn. Thử lại nhé!')
    },
  })
}

export function useDeleteStorySession(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) =>
      storySessionService.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'today', userId] })
    },
    onError: () => {
      toast.error('Không thể xoá phiên. Thử lại nhé!')
    },
  })
}

export function useCompleteStoryActivity(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      sessionId,
      activityType,
    }: {
      sessionId: string
      activityType: StoryActivityType
    }) => storySessionService.completeActivity(sessionId, activityType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'today', userId] })
    },
    onError: () => {
      toast.error('Lưu tiến trình thất bại. Thử lại nhé!')
    },
  })
}

export function useCompleteStorySession(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) =>
      storySessionService.completeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'today', userId] })
    },
  })
}
