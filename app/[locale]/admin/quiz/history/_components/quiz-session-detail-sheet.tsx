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

  const scoreColor =
    scorePercent >= 80
      ? 'text-emerald-400'
      : scorePercent >= 50
        ? 'text-amber-400'
        : 'text-red-400'

  return (
    <Sheet open={!!session} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t('detailTitle')}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-4 pb-6">
          <div className="rounded-xl border bg-white/3 py-5 text-center">
            <p className={`text-5xl font-bold ${scoreColor}`}>
              {scorePercent}%
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              {session.correct_count} / {session.total_questions} &mdash;{' '}
              {t('resultsTime', { seconds: duration })}
            </p>
            <div className="mx-6 mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all ${scorePercent >= 80 ? 'bg-emerald-400' : scorePercent >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${scorePercent}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
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
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-emerald-400">
              <CheckCircle size={16} className="shrink-0" />
              <p className="text-sm font-medium">{t('perfectScore')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold">{t('mistakesTitle')}</p>
              {session.incorrect_words.map((w, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-red-500/15 bg-red-500/5 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <XCircle size={14} className="shrink-0 text-red-500" />
                    <span className="text-sm font-semibold">{w.word}</span>
                    <span className="text-muted-foreground text-xs">
                      &mdash; {w.meaning}
                    </span>
                  </div>
                  {w.user_answer && (
                    <div className="mt-2 pl-5">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-muted-foreground shrink-0">
                          {t('yourAnswer')}:
                        </span>
                        <span className="text-red-400">{w.user_answer}</span>
                      </div>
                    </div>
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
