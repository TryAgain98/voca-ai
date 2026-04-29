'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'

import { Button } from '~/components/ui/button'
import { useSpeechRecognition } from '~/hooks/use-speech-recognition'
import { useTTS } from '~/hooks/use-tts'
import { playCorrectSound, playWrongSound } from '~/lib/feedback-sound'

import { buildSpeechDiff } from '../_utils/phoneme-diff'

import { MicStatus } from './_components/mic-status'
import { ResultFeedback } from './_components/result-feedback'
import { SpeakButton } from './_components/speak-button'
import { VocabCard } from './_components/vocab-card'
import { useSpeechAttempts } from './_hooks/use-speech-attempts'

import type { SpeakExercise } from '../../../_types/review.types'

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
  const { canBypass, incrementAttempts, resetAttempts } = useSpeechAttempts()

  const isTTSActive = isSpeaking || isLoading
  const autoRecordRef = useRef(true)
  const ttsWasActiveRef = useRef(false)

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
    if (status === 'done' && diff && !diff.isExact) {
      playWrongSound()
      incrementAttempts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const handleListen = () => {
    reset()
    resetAttempts()
    autoRecordRef.current = true
    ttsWasActiveRef.current = false
    speak()
  }

  const handleSpeak = () => {
    reset()
    start()
  }

  const handleRetry = () => {
    reset()
    start()
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
      <VocabCard
        exercise={exercise}
        isSpeaking={isSpeaking}
        isLoading={isLoading}
        onListen={handleListen}
      />

      {status === 'done' && diff?.isExact && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-base font-semibold text-green-400"
        >
          {t('speechPerfect')}
        </motion.p>
      )}

      {status === 'done' && diff && !diff.isExact && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ResultFeedback
            diff={diff}
            transcript={transcript}
            canBypass={canBypass}
            onRetry={handleRetry}
            onSkip={() => onAnswer(false)}
          />
        </motion.div>
      )}

      {(status === 'idle' || status === 'error') && (
        <>
          <MicStatus status={status} />
          <SpeakButton isTTSActive={isTTSActive} onClick={handleSpeak} />
        </>
      )}

      {status === 'listening' && <MicStatus status={status} />}
    </div>
  )
}
