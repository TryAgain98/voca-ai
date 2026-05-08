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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
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

function getScoreColor(percent: number): string {
  if (percent >= 80) return 'text-emerald-400'
  if (percent >= 50) return 'text-amber-400'
  return 'text-red-400'
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
      <Table>
        <TableHeader className="bg-background sticky top-0 z-10">
          <TableRow>
            <TableHead>{t('table.date')}</TableHead>
            <TableHead className="text-right">{t('table.score')}</TableHead>
            <TableHead className="text-right">{t('table.correct')}</TableHead>
            <TableHead className="text-right">{t('table.duration')}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => {
            const scorePercent = Math.round(session.score * 100)
            const duration = Math.round(
              (new Date(session.end_time).getTime() -
                new Date(session.start_time).getTime()) /
                1000,
            )
            const scoreColor = getScoreColor(scorePercent)

            return (
              <TableRow
                key={session.id}
                onClick={() => setSelectedSession(session)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && setSelectedSession(session)
                }
                tabIndex={0}
                className="hover:bg-accent/40 cursor-pointer"
              >
                <TableCell className="text-sm">
                  {new Date(session.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell
                  className={`text-right text-base font-[590] ${scoreColor}`}
                >
                  {scorePercent}%
                </TableCell>
                <TableCell className="text-muted-foreground text-right text-sm">
                  {session.correct_count}/{session.total_questions}
                </TableCell>
                <TableCell className="text-muted-foreground text-right text-sm">
                  {t('resultsTime', { seconds: duration })}
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  role="presentation"
                >
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
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
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <QuizSessionDetailSheet
        session={selectedSession}
        lessonNameMap={lessonNameMap}
        onClose={() => setSelectedSession(null)}
      />
    </>
  )
}
