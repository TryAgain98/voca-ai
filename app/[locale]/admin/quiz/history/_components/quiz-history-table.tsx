'use client'

import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { useLessons } from '~/hooks/use-lessons'
import {
  useDeleteQuizSession,
  useQuizSessions,
} from '~/hooks/use-quiz-sessions'

import { QuizSessionDetailSheet } from './quiz-session-detail-sheet'

import type { QuizSession } from '~/types'

interface QuizHistoryTableProps {
  userId: string
}

export function QuizHistoryTable({ userId }: QuizHistoryTableProps) {
  const t = useTranslations('Quiz')
  const { data: sessions = [], isLoading } = useQuizSessions(userId)
  const { data: lessons = [] } = useLessons()
  const { mutate: deleteSession, isPending: isDeleting } =
    useDeleteQuizSession()
  const [selectedSession, setSelectedSession] = useState<QuizSession | null>(
    null,
  )

  const lessonNameMap = Object.fromEntries(lessons.map((l) => [l.id, l.name]))

  if (isLoading) {
    return (
      <div className="text-muted-foreground py-12 text-center text-sm">
        {t('loadingHistory')}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center text-sm">
        {t('noHistory')}
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {sessions.map((session) => {
          const scorePercent = Math.round(session.score * 100)
          const duration = Math.round(
            (new Date(session.end_time).getTime() -
              new Date(session.start_time).getTime()) /
              1000,
          )
          const lessonNames = session.lesson_ids
            .map((id) => lessonNameMap[id])
            .filter(Boolean)
            .join(', ')

          const scoreColor =
            scorePercent >= 80
              ? 'text-emerald-400'
              : scorePercent >= 50
                ? 'text-amber-400'
                : 'text-red-400'

          return (
            <div
              key={session.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedSession(session)}
              onKeyDown={(e) =>
                e.key === 'Enter' && setSelectedSession(session)
              }
              className="hover:bg-accent/40 flex w-full cursor-pointer items-center gap-4 rounded-xl border px-4 py-3 text-left transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {lessonNames || t('allLessons')}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {new Date(session.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  — {t('resultsTime', { seconds: duration })}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`text-lg font-bold ${scoreColor}`}>
                  {scorePercent}%
                </p>
                <p className="text-muted-foreground text-xs">
                  {session.correct_count}/{session.total_questions}
                </p>
              </div>
              <div
                role="presentation"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        disabled={isDeleting}
                      />
                    }
                  >
                    <Trash2 size={14} />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t('deleteConfirmTitle')}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('deleteConfirmDesc')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {t('deleteConfirmCancel')}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          deleteSession({ id: session.id, userId })
                        }
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {t('deleteConfirmOk')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )
        })}
      </div>

      <QuizSessionDetailSheet
        session={selectedSession}
        lessonNameMap={lessonNameMap}
        onClose={() => setSelectedSession(null)}
      />
    </>
  )
}
