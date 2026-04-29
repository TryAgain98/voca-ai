'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Loader2, Mic, Volume2, VolumeX } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'

import { Button } from '~/components/ui/button'
import { useSpeechRecognition } from '~/hooks/use-speech-recognition'
import { useTTS } from '~/hooks/use-tts'
import { cn } from '~/lib/cn'
import { playCorrectSound, playWrongSound } from '~/lib/feedback-sound'

import { buildSpeechDiff } from './_utils/phoneme-diff'

import type { DiffToken } from './_utils/phoneme-diff'
import type { SpeakExercise } from '../../_types/review.types'

const CORRECT_ADVANCE_DELAY_MS = 1200

interface SpeechExerciseCardProps {
  exercise: SpeakExercise
  onAnswer: (isCorrect: boolean) => void
}

export function SpeechExerciseCard({
  exercise,
  onAnswer,
}: SpeechExerciseCardProps) {
  const t = useTranslations('Review')
  const { speak, isSpeaking, isLoading } = useTTS(exercise.vocab.word)
  const { status, transcript, start, reset, isSupported } =
    useSpeechRecognition()

  const isTTSActive = isSpeaking || isLoading
  const autoRecordRef = useRef(true)
  const ttsWasActiveRef = useRef(false)

  // Auto-start mic whenever TTS finishes (if autoRecordRef is armed)
  useEffect(() => {
    if (isTTSActive) {
      ttsWasActiveRef.current = true
      return
    }
    if (!ttsWasActiveRef.current || !autoRecordRef.current) return
    ttsWasActiveRef.current = false
    autoRecordRef.current = false
    const timer = setTimeout(start, 400)
    return () => clearTimeout(timer)
  }, [isTTSActive, start])

  // Auto-play TTS on mount
  useEffect(() => {
    const timer = setTimeout(speak, 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const diff =
    status === 'done' ? buildSpeechDiff(exercise.vocab.word, transcript) : null

  useEffect(() => {
    if (!diff?.isExact) return
    playCorrectSound()
    const timer = setTimeout(() => onAnswer(true), CORRECT_ADVANCE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [diff?.isExact, onAnswer])

  useEffect(() => {
    if (status === 'done' && diff && !diff.isExact) playWrongSound()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const handleListenAndRetry = () => {
    reset()
    autoRecordRef.current = true
    ttsWasActiveRef.current = false
    speak()
  }

  if (!isSupported) {
    return (
      <div className="bg-card flex flex-col items-center gap-4 rounded-2xl border px-6 py-6 text-center">
        <p className="text-muted-foreground text-sm">{t('speakUnsupported')}</p>
        <Button onClick={() => onAnswer(false)}>{t('continueBtn')}</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Card */}
      <motion.div
        key={exercise.vocab.id}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-5"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-emerald-400/40" />
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2.5">
              <p className="text-2xl font-semibold tracking-tight">
                {exercise.vocab.word}
              </p>
              {exercise.vocab.phonetic && (
                <span className="text-muted-foreground font-mono text-sm">
                  {exercise.vocab.phonetic}
                </span>
              )}
            </div>
            {exercise.vocab.word_type && (
              <span className="w-fit rounded bg-emerald-500/15 px-1.5 py-0.5 text-xs text-emerald-300">
                {exercise.vocab.word_type}
              </span>
            )}
          </div>
          <ListenButton
            isSpeaking={isSpeaking}
            isLoading={isLoading}
            onClick={handleListenAndRetry}
          />
        </div>
        <p className="text-muted-foreground mt-2 text-sm">
          {exercise.vocab.meaning}
        </p>
        {exercise.vocab.example && (
          <p className="text-muted-foreground/70 mt-1.5 text-xs italic">
            &ldquo;{exercise.vocab.example}&rdquo;
          </p>
        )}
        <p className="text-muted-foreground/60 mt-3 text-xs">
          {t('speakInstructions')}
        </p>
      </motion.div>

      {/* Mic status */}
      <MicStatus status={status} t={t} />

      {/* Diff feedback */}
      {status === 'done' && diff && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-4"
        >
          <PhonemeDisplay tokens={diff.tokens} />
          <p className="text-muted-foreground text-sm">
            {t('youSaid')}:{' '}
            <span className="text-foreground font-mono">
              {transcript || '—'}
            </span>
          </p>
          {diff.expectedSyllables !== diff.recognizedSyllables && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <AlertTriangle size={12} />
              <span>
                {t('stressError', { expected: diff.expectedSyllables })}
              </span>
            </div>
          )}
          {diff.isExact ? (
            <p className="text-base font-semibold text-green-400">
              {t('speechPerfect')}
            </p>
          ) : diff.matchRatio >= 0.8 ? (
            <p className="text-sm text-amber-400">{t('speechClose')}</p>
          ) : (
            <p className="text-muted-foreground text-sm">{t('speechWrong')}</p>
          )}
        </motion.div>
      )}

      {/* Actions */}
      {status === 'error' && (
        <p className="text-muted-foreground text-center text-sm">
          {t('speakError')}
        </p>
      )}
      {status === 'done' && !diff?.isExact && (
        <Button
          onClick={() => onAnswer(false)}
          variant="outline"
          className="w-full"
        >
          {t('continueBtn')}
        </Button>
      )}
    </div>
  )
}

function ListenButton({
  isSpeaking,
  isLoading,
  onClick,
}: {
  isSpeaking: boolean
  isLoading: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors',
        isSpeaking
          ? 'border-emerald-500/40 text-emerald-400'
          : 'text-muted-foreground hover:text-foreground border-white/10 hover:border-white/20',
      )}
    >
      {isLoading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : isSpeaking ? (
        <VolumeX size={12} />
      ) : (
        <Volume2 size={12} />
      )}
      Listen
    </button>
  )
}

function MicStatus({
  status,
  t,
}: {
  status: string
  t: ReturnType<typeof useTranslations>
}) {
  if (status === 'idle') return null
  return (
    <div className="flex items-center justify-center gap-2 py-1">
      <Mic
        size={15}
        className={cn(
          status === 'listening' && 'animate-pulse text-red-400',
          status === 'done' && 'text-green-400',
          status === 'error' && 'text-muted-foreground',
        )}
      />
      <span className="text-muted-foreground text-sm">
        {status === 'listening' && t('listeningLabel')}
        {status === 'done' && t('youSaid')}
        {status === 'error' && t('speakError')}
      </span>
    </div>
  )
}

function PhonemeDisplay({ tokens }: { tokens: DiffToken[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-px font-mono text-3xl font-semibold tracking-wider">
      {tokens
        .filter((t) => t.status !== 'extra')
        .map((token, i) => (
          <span
            key={i}
            className={cn(
              token.status === 'match' && 'text-green-400',
              token.status === 'wrong' &&
                'text-red-400 underline decoration-red-400 decoration-wavy',
              token.status === 'missing' &&
                'text-amber-400 line-through opacity-50',
            )}
          >
            {token.char}
          </span>
        ))}
    </div>
  )
}
