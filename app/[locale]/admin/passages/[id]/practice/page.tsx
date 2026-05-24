'use client'

import { useUser } from '@clerk/nextjs'
import { ArrowLeft, Globe } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useMemo, useRef } from 'react'

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
  const { user } = useUser()
  const passageId = params.id as string
  const startedAtRef = useRef<number>(0)

  const { data: passage, isLoading } = usePassage(passageId)
  const { data: allVocabs = [] } = useVocabulariesByLessons()
  const { data: sessions = [] } = usePassageSessions(passageId)
  const session = usePracticeSession(passage?.content ?? '')

  const vocabMap = useMemo(() => {
    const map = new Map<string, Vocabulary>()
    allVocabs.forEach((v) => map.set(v.word.toLowerCase(), v))
    return map
  }, [allVocabs])

  const segmentTranslations = useMemo(() => {
    if (!passage?.translation || !passage.segments.length) return []
    const fullTranslation = passage.translation
    return passage.segments.map(() => fullTranslation)
  }, [passage])

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
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/admin/passages`}>
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-[#f7f8f8]">
            {passage.title}
          </h1>
          {passage.summary && (
            <p className="truncate text-xs text-[#8a8f98]">{passage.summary}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {bestScore !== null && (
            <span
              className={cn('text-sm font-semibold', scoreColor(bestScore))}
            >
              Best: {bestScore}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'size-8',
              session.showTranslation && 'text-[#7170ff]',
            )}
            onClick={session.toggleTranslation}
            title="Toggle translation"
          >
            <Globe size={16} />
          </Button>
          <Link href={`/${locale}/admin/passages/${passageId}/exam`}>
            <Button size="sm" className="gap-1.5">
              Thi ngay
            </Button>
          </Link>
        </div>
      </div>

      {passage.time_good && (
        <div className="flex gap-3 text-xs">
          <span className="text-emerald-400">Tốt: {passage.time_good}s</span>
          <span className="text-[#8a8f98]">·</span>
          <span className="text-amber-400">Ổn: {passage.time_ok}s</span>
          <span className="text-[#8a8f98]">·</span>
          <span className="text-orange-400">
            Chấp nhận: {passage.time_acceptable}s
          </span>
        </div>
      )}

      <div
        className="rounded-xl border p-4"
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <PassageText
          segments={passage.segments}
          wordTags={passage.word_tags}
          vocabMap={vocabMap}
          wordResults={session.wordResults}
          showTranslation={session.showTranslation}
          segmentTranslations={segmentTranslations}
        />
      </div>

      <PracticeRecorder
        state={session.state}
        score={session.score}
        isSupported={session.isSupported}
        onStart={() => {
          startedAtRef.current = Date.now()
          session.startListening()
        }}
        onReset={session.reset}
        onSave={() => {
          const duration = Math.round(
            (Date.now() - startedAtRef.current) / 1000,
          )
          session.saveResult(passageId, user?.id ?? '', duration)
        }}
      />
    </div>
  )
}
