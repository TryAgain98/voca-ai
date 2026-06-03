'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { StoryGenrePicker } from '~/app/[locale]/admin/review/_components/story-genre-picker'
import { useTodayStorySession } from '~/hooks/use-story-session'

import type { ReviewWord } from '~/types'
import type { StoryActivityType, StoryWord } from '~/types'

const ACTIVITY_ORDER: StoryActivityType[] = ['read', 'quiz', 'type']
const MIN_WRONG = 5

interface StorySessionCardProps {
  userId: string
  wrongTodayCount: number
  wrongTodayWords: ReviewWord[]
  isLoading: boolean
}

export function StorySessionCard({
  userId,
  wrongTodayCount,
  wrongTodayWords,
  isLoading,
}: StorySessionCardProps) {
  const t = useTranslations('Story')
  const params = useParams()
  const locale = params.locale as string
  const [showPicker, setShowPicker] = useState(false)

  const { data: session, isLoading: isSessionLoading } =
    useTodayStorySession(userId)

  if (isLoading || isSessionLoading) {
    return (
      <div className="bg-card h-20 w-full animate-pulse rounded-2xl border" />
    )
  }

  if (!session && wrongTodayCount < MIN_WRONG) return null

  const completedCount = session
    ? session.activities.filter((a) => a.is_complete).length
    : 0
  const isComplete = session?.status === 'complete'

  const nextActivity = session
    ? (ACTIVITY_ORDER.find(
        (a) =>
          !session.activities.find((p) => p.activity_type === a)?.is_complete,
      ) ?? null)
    : null

  const wrongWords: StoryWord[] = wrongTodayWords.map((w) => ({
    id: w.id,
    word: w.word,
    meaning: w.meaning,
  }))

  if (session) {
    const href = `/${locale}/admin/story-session/${session.id}`
    return (
      <Link
        href={href}
        className="bg-card hover:bg-muted/50 flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            <BookOpen size={16} className="text-primary" />
          </div>
          <div>
            {isComplete ? (
              <>
                <p className="text-sm font-[510]">
                  {t('dashboardCompleteTitle')}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t('dashboardCompleteDesc')}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-[510]">
                  {t('dashboardActiveTitle')}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t('dashboardActiveDesc', {
                    done: completedCount,
                    total: ACTIVITY_ORDER.length,
                  })}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!isComplete && (
            <div className="flex gap-1">
              {ACTIVITY_ORDER.map((a, i) => {
                const done = session.activities.find(
                  (p) => p.activity_type === a,
                )?.is_complete
                return (
                  <div
                    key={i}
                    className={
                      done
                        ? 'h-1.5 w-5 rounded-full bg-emerald-500'
                        : a === nextActivity
                          ? 'bg-primary h-1.5 w-5 rounded-full'
                          : 'bg-muted h-1.5 w-5 rounded-full'
                    }
                  />
                )
              })}
            </div>
          )}
          {isComplete && (
            <span className="text-xs font-[510] text-emerald-400">
              {t('dashboardCompleteBadge')}
            </span>
          )}
          <ChevronRight size={14} className="text-muted-foreground" />
        </div>
      </Link>
    )
  }

  return (
    <div className="bg-card rounded-2xl border px-5 py-4">
      <button
        onClick={() => setShowPicker((v) => !v)}
        className="flex w-full items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            <BookOpen size={16} className="text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-[510]">{t('dashboardCTATitle')}</p>
            <p className="text-muted-foreground text-xs">
              {t('dashboardCTADesc', { count: wrongTodayCount })}
            </p>
          </div>
        </div>
        <ChevronRight
          size={14}
          className={`text-muted-foreground shrink-0 transition-transform ${showPicker ? 'rotate-90' : ''}`}
        />
      </button>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              <StoryGenrePicker userId={userId} wrongWords={wrongWords} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
