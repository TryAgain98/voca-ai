'use client'

import { useUser } from '@clerk/nextjs'
import { RefreshCw } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { StoryGenrePicker } from '~/app/[locale]/admin/review/_components/story-genre-picker'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  useCompleteStoryActivity,
  useCompleteStorySession,
} from '~/hooks/use-story-session'
import { storySessionService } from '~/services/story-session.service'

import { StoryComplete } from './_components/story-complete'
import { StoryProgressBar } from './_components/story-progress-bar'
import { StoryQuiz } from './_components/story-quiz'
import { StoryRead } from './_components/story-read'
import { StoryType } from './_components/story-type'

import type {
  StoryActivityType,
  StorySessionWithProgress,
  StoryWord,
} from '~/types'

const ACTIVITY_ORDER: StoryActivityType[] = ['read', 'quiz', 'type']

export default function StorySessionPage() {
  const t = useTranslations('Story')
  const { user } = useUser()
  const params = useParams()
  const sessionId = params.id as string
  const locale = params.locale as string

  const [session, setSession] = useState<StorySessionWithProgress | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [isDone, setIsDone] = useState(false)
  const [showRegeneratePicker, setShowRegeneratePicker] = useState(false)

  const { mutate: completeActivity, isPending: isCompletingActivity } =
    useCompleteStoryActivity(user?.id ?? '')
  const { mutate: completeSession } = useCompleteStorySession(user?.id ?? '')

  useEffect(() => {
    storySessionService
      .findTodaySession(user?.id ?? '')
      .then((s) => {
        setSession(s)
        setIsLoadingSession(false)
      })
      .catch(() => setIsLoadingSession(false))
  }, [user?.id])

  if (isLoadingSession) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-4">
        <div className="bg-muted h-8 w-48 animate-pulse rounded-lg" />
        <div className="bg-muted h-48 w-full animate-pulse rounded-2xl" />
      </div>
    )
  }

  if (!session) {
    return (
      <p className="text-muted-foreground text-sm">{t('sessionNotFound')}</p>
    )
  }

  if (isDone || session.status === 'complete') {
    return <StoryComplete />
  }

  const completedActivities = session.activities
    .filter((a) => a.is_complete)
    .map((a) => a.activity_type)

  const currentActivity =
    ACTIVITY_ORDER.find((a) => !completedActivities.includes(a)) ?? null

  if (!currentActivity) {
    return <StoryComplete />
  }

  const canRegenerate = completedActivities.length === 0

  const wrongWords: StoryWord[] = session.wrong_words

  function handleActivityComplete() {
    if (!session || !currentActivity) return
    completeActivity(
      { sessionId, activityType: currentActivity },
      {
        onSuccess: () => {
          const nextCompleted = [...completedActivities, currentActivity]
          const allDone = ACTIVITY_ORDER.every((a) => nextCompleted.includes(a))
          if (allDone) {
            completeSession(sessionId)
            setIsDone(true)
          } else {
            setSession((prev) => {
              if (!prev) return prev
              return {
                ...prev,
                activities: prev.activities.map((a) =>
                  a.activity_type === currentActivity
                    ? { ...a, is_complete: true }
                    : a,
                ),
              }
            })
          }
        },
      },
    )
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-xs">
            {t('pageSubtitle', { count: session.wrong_words.length })}
          </p>
          <StoryProgressBar
            completedActivities={completedActivities}
            currentActivity={currentActivity}
          />
        </div>

        {canRegenerate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRegeneratePicker((v) => !v)}
            className="text-muted-foreground shrink-0 gap-1.5 text-xs"
          >
            <RefreshCw size={12} />
            {t('regenerateBtn')}
          </Button>
        )}
      </div>

      <Dialog
        open={showRegeneratePicker}
        onOpenChange={setShowRegeneratePicker}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-[510] tracking-wider uppercase">
              {t('regenerateTitle')}
            </DialogTitle>
          </DialogHeader>
          <StoryGenrePicker
            userId={user?.id ?? ''}
            locale={locale}
            wrongWords={wrongWords}
          />
        </DialogContent>
      </Dialog>

      {currentActivity === 'read' && (
        <StoryRead
          passageText={session.passage_text}
          translation={session.translation}
          targetWords={session.wrong_words}
          onComplete={handleActivityComplete}
          isLoading={isCompletingActivity}
        />
      )}
      {currentActivity === 'quiz' && (
        <StoryQuiz
          targetWords={session.wrong_words}
          onComplete={handleActivityComplete}
          isLoading={isCompletingActivity}
        />
      )}
      {currentActivity === 'type' && (
        <StoryType
          targetWords={session.wrong_words}
          onComplete={handleActivityComplete}
          isLoading={isCompletingActivity}
        />
      )}
    </div>
  )
}
