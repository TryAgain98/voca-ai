'use client'

import { CheckCircle, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Badge } from '~/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet'

import type { QuizSession } from '~/types'

interface QuizSessionDetailSheetProps {
  session: QuizSession | null
  lessonNameMap: Record<string, string>
  onClose: () => void
}

export function QuizSessionDetailSheet({
  session,
  lessonNameMap,
  onClose,
}: QuizSessionDetailSheetProps) {
  const t = useTranslations('Quiz')

  if (!session) return null

  const duration = Math.round(
    (new Date(session.end_time).getTime() -
      new Date(session.start_time).getTime()) /
      1000,
  )
  const scorePercent = Math.round(session.score * 100)
  const lessonNames = session.lesson_ids.map((id) => lessonNameMap[id] ?? id)

  return (
    <Sheet open={!!session} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t('detailTitle')}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-5">
          <div className="bg-card rounded-xl border px-5 py-4 text-center">
            <p className="text-primary text-4xl font-bold">{scorePercent}%</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {session.correct_count} / {session.total_questions} —{' '}
              {t('resultsTime', { seconds: duration })}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              {t('selectLessons')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {lessonNames.map((name) => (
                <Badge key={name} variant="secondary">
                  {name}
                </Badge>
              ))}
            </div>
          </div>

          {session.incorrect_words.length === 0 ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle size={16} />
              <p className="text-sm font-medium">{t('perfectScore')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold">{t('mistakesTitle')}</p>
              {session.incorrect_words.map((w, i) => (
                <div key={i} className="rounded-xl border px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <XCircle size={14} className="shrink-0 text-red-500" />
                    <span className="font-semibold">{w.word}</span>
                  </div>
                  <p className="text-muted-foreground mt-1 pl-5 text-xs">
                    {t('correctAnswer')}: {w.meaning}
                  </p>
                  {w.user_answer && (
                    <p className="mt-0.5 pl-5 text-xs text-red-400">
                      {t('yourAnswer')}: {w.user_answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
