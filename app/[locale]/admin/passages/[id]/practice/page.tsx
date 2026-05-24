'use client'

import { ArrowLeft, Globe } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo } from 'react'

import { Button } from '~/components/ui/button'
import { usePassageSessions } from '~/hooks/use-passage-sessions'
import { usePassage } from '~/hooks/use-passages'
import { useVocabulariesByLessons } from '~/hooks/use-vocabularies'
import { scoreColor } from '~/lib/passage-score'
import { cn } from '~/lib/utils'

import { PassageText } from './_components/passage-text'
import { PracticeRecorder } from './_components/practice-recorder'
import { usePracticeSession } from './_hooks/use-practice-session'

import type { Vocabulary } from '~/types'

export default function PracticePage() {
  const params = useParams()
  const locale = useLocale()
  const t = useTranslations('Passages')
  const passageId = params.id as string

  const { data: passage, isLoading } = usePassage(passageId)
  const { data: allVocabs = [] } = useVocabulariesByLessons()
  const { data: sessions = [] } = usePassageSessions(passageId)
  const session = usePracticeSession(passage?.content ?? '')

  const vocabMap = useMemo(() => {
    const map = new Map<string, Vocabulary>()
    allVocabs.forEach((v) => map.set(v.word.toLowerCase(), v))
    return map
  }, [allVocabs])

  const bestScore = useMemo(() => {
    const practiceSessions = sessions.filter((s) => s.mode === 'practice')
    if (!practiceSessions.length) return null
    return Math.max(...practiceSessions.map((s) => s.overall_score ?? 0))
  }, [sessions])

  if (isLoading || !passage) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5e6ad2] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/admin/passages`}>
            <Button variant="ghost" size="icon" className="size-8 shrink-0">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <h1 className="text-foreground min-w-0 flex-1 truncate text-sm font-[510]">
            {passage.title}
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            {bestScore !== null && (
              <span
                className={cn('text-sm font-semibold', scoreColor(bestScore))}
              >
                {t('bestScore')}: {bestScore}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'gap-1.5 text-xs',
                session.showTranslation
                  ? 'text-[#7170ff]'
                  : 'text-[#8a8f98] hover:text-[#d0d6e0]',
              )}
              onClick={session.toggleTranslation}
            >
              <Globe size={14} />
              {t('meaningToggle')}
            </Button>
            <Link href={`/${locale}/admin/passages/${passageId}/exam`}>
              <Button size="sm" className="gap-1.5">
                {t('examNow')}
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-11">
          <span
            className="rounded-full border px-2 py-0.5 text-[10px] font-[510] text-[#7170ff]"
            style={{
              background: 'rgba(113,112,255,0.08)',
              borderColor: 'rgba(113,112,255,0.25)',
            }}
          >
            {t('practiceMode')}
          </span>
          {passage.time_good && (
            <span className="text-xs text-[#8a8f98]">
              <span className="text-emerald-400">
                {t('timeGood')}: {passage.time_good}s
              </span>
              {' · '}
              <span className="text-amber-400">
                {t('timeOk')}: {passage.time_ok}s
              </span>
              {' · '}
              <span className="text-orange-400">
                {t('timeAcceptable')}: {passage.time_acceptable}s
              </span>
            </span>
          )}
        </div>
      </div>

      <div
        className="rounded-xl border p-4"
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <PassageText
          content={passage.content}
          vocabMap={vocabMap}
          wordResults={session.wordResults}
        />
      </div>

      {session.showTranslation && passage.translation && (
        <div
          className="rounded-xl border p-4"
          style={{
            background: 'rgba(255,255,255,0.02)',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <p className="text-sm text-[#8a8f98] italic">{passage.translation}</p>
        </div>
      )}

      <PracticeRecorder
        state={session.state}
        score={session.score}
        elapsedSeconds={session.elapsedSeconds}
        audioUrl={session.audioUrl}
        isSupported={session.isSupported}
        onStart={session.startListening}
        onStop={session.stopListening}
        onReset={session.reset}
      />
    </div>
  )
}
