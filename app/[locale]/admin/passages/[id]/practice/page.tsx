'use client'

import { ArrowLeft, Globe, Play, Volume2, VolumeX } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '~/components/ui/button'
import { usePassageSessions } from '~/hooks/use-passage-sessions'
import { usePassage } from '~/hooks/use-passages'
import { scoreColor } from '~/lib/passage-score'
import { cn } from '~/lib/utils'

import { ExamResults } from '../exam/_components/exam-results'

import { PassageText } from './_components/passage-text'
import { PracticeRecorder } from './_components/practice-recorder'
import { usePracticeSession } from './_hooks/use-practice-session'

export default function PracticePage() {
  const params = useParams()
  const locale = useLocale()
  const t = useTranslations('Passages')
  const passageId = params.id as string

  const { data: passage, isLoading } = usePassage(passageId)
  const { data: sessions = [] } = usePassageSessions(passageId)
  const session = usePracticeSession(passage?.content ?? '')
  const benchmarkTime = passage?.time_good ?? null

  const bestScore = useMemo(() => {
    const practiceSessions = sessions.filter((s) => s.mode === 'practice')
    if (!practiceSessions.length) return null
    return Math.max(...practiceSessions.map((s) => s.overall_score ?? 0))
  }, [sessions])

  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  const handleSpeak = (): void => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(passage?.content ?? '')
    utterance.lang = 'en-US'
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }

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
                isSpeaking
                  ? 'text-[#7170ff]'
                  : 'text-[#8a8f98] hover:text-[#d0d6e0]',
              )}
              onClick={handleSpeak}
            >
              {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              {isSpeaking ? t('stopReading') : t('readAloud')}
            </Button>
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
                {t('timeLabel')}: {passage.time_good}s
              </span>
            </span>
          )}
        </div>
      </div>

      {session.state === 'scored' && session.wordResults ? (
        <ExamResults
          content={passage.content}
          wordResults={session.wordResults}
          score={session.score}
          scoreLabel="phát âm"
          pronunciationScore={session.score}
          elapsed={session.elapsedSeconds}
          benchmarkTime={benchmarkTime}
        />
      ) : (
        <div
          className="rounded-xl border p-4"
          style={{
            background: 'rgba(255,255,255,0.02)',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <PassageText
            content={passage.content}
            passageId={passageId}
            wordResults={null}
          />
        </div>
      )}

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

      {session.state === 'scored' && session.audioUrl && (
        <div
          className="flex items-center gap-2 rounded-xl border p-3"
          style={{
            background: 'rgba(255,255,255,0.02)',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <Play size={14} className="shrink-0 text-[#7170ff]" />
          <span className="sr-only">{t('playback')}</span>
          <audio
            src={session.audioUrl}
            controls
            className="h-8 w-full"
            style={{ colorScheme: 'dark' }}
          />
        </div>
      )}

      <PracticeRecorder
        state={session.state}
        elapsedSeconds={session.elapsedSeconds}
        isSupported={session.isSupported}
        onStart={session.startListening}
        onStop={session.stopListening}
        onReset={session.reset}
      />
    </div>
  )
}
