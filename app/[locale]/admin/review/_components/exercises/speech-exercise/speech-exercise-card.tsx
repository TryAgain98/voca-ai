'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef } from 'react'

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

import type { AnswerHandler, SpeakExercise } from '../../../_types/review.types'
import type { ExerciseMode } from '../mcq-exercise'

const CORRECT_ADVANCE_DELAY_MS = 1200
const QUIZ_ADVANCE_DELAY_MS = 350
const AUTO_RECORD_DELAY_MS = 250
const IS_SPEECH_DEBUG_ENABLED = process.env.NODE_ENV !== 'production'

interface SpeechExerciseCardProps {
  exercise: SpeakExercise
  onAnswer: AnswerHandler
  mode?: ExerciseMode
}

export function SpeechExerciseCard({
  exercise,
  onAnswer,
  mode = 'review',
}: SpeechExerciseCardProps) {
  const isQuiz = mode === 'quiz'
  const t = useTranslations('Review')
  const { speak, isSpeaking, isLoading } = useTTS(exercise.vocab.word)
  const { status, transcript, alternatives, start, reset, isSupported } =
    useSpeechRecognition()
  const { canBypass, incrementAttempts, resetAttempts } = useSpeechAttempts()

  const isTTSActive = isSpeaking || isLoading
  const startedAtRef = useRef<number>(0)
  const autoRecordRef = useRef(true)
  const ttsWasActiveRef = useRef(false)

  useEffect(() => {
    if (!isSupported) return
    if (isTTSActive) {
      ttsWasActiveRef.current = true
      return
    }
    if (!ttsWasActiveRef.current || !autoRecordRef.current) return

    ttsWasActiveRef.current = false
    autoRecordRef.current = false
    const timer = setTimeout(() => {
      startedAtRef.current = Date.now()
      start()
    }, AUTO_RECORD_DELAY_MS)

    return () => clearTimeout(timer)
  }, [isSupported, isTTSActive, start])

  useEffect(() => {
    startedAtRef.current = Date.now()
    const timer = setTimeout(speak, 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const diff = useMemo(
    () =>
      status === 'done'
        ? buildSpeechDiff(
            exercise.vocab.word,
            alternatives.length > 0 ? alternatives : transcript,
          )
        : null,
    [alternatives, exercise.vocab.word, status, transcript],
  )

  useEffect(() => {
    if (!IS_SPEECH_DEBUG_ENABLED || status !== 'done' || !diff) return

    const verdict = diff.isClose ? 'CLOSE_PASS' : diff.isPass ? 'PASS' : 'RETRY'
    console.groupCollapsed(
      `[SpeechDebug] ${exercise.vocab.word} -> ${verdict} (${diff.decisionReason})`,
    )
    console.log('summary', {
      expected: diff.debug.expected,
      normalizedExpected: diff.debug.normalizedExpected,
      browserTranscripts: diff.debug.rawTranscripts,
      bestTranscript: diff.bestTranscript,
      verdict,
      reason: diff.decisionReason,
      autoAdvance: diff.isPass,
      score: diff.score,
      displayScore: diff.displayScore,
      passThreshold: Math.round(diff.debug.passThreshold * 100),
      closeThreshold: Math.round(diff.debug.closeThreshold * 100),
      expectedDictionaryPronunciations:
        diff.debug.expectedDictionaryPronunciations,
      expectedPhoneticCodes: diff.debug.expectedPhoneticCodes,
      expectedConsonantSkeleton: diff.debug.expectedConsonantSkeleton,
      expectedVowelSkeleton: diff.debug.expectedVowelSkeleton,
    })
    console.table(
      diff.debug.candidates.map((candidate) => ({
        transcript: candidate.transcript,
        score: candidate.score,
        reason: candidate.reason,
        pass: candidate.isPass,
        close: candidate.isClose,
        exact: candidate.isExact,
        phonetic: candidate.isPhoneticMatch,
        textPass: candidate.isTextPass,
        phrasePass: candidate.isPhrasePass,
        dictionary: candidate.dictionaryPronunciations.join(' | '),
        phoneticCodes: candidate.phoneticCodes.join(', '),
        consonantSkeleton: candidate.consonantSkeleton,
        vowelSkeleton: candidate.vowelSkeleton,
      })),
    )
    console.log('diffTokens', diff.tokens)
    console.groupEnd()
  }, [status, diff, exercise.vocab.word])

  useEffect(() => {
    if (status !== 'done' || !diff) return
    const responseMs = Date.now() - startedAtRef.current
    if (isQuiz) {
      const timer = setTimeout(
        () => onAnswer(diff.isPass, { responseMs }),
        QUIZ_ADVANCE_DELAY_MS,
      )
      return () => clearTimeout(timer)
    }
    if (diff.isPass) {
      playCorrectSound()
      const timer = setTimeout(
        () => onAnswer(true, { responseMs }),
        CORRECT_ADVANCE_DELAY_MS,
      )
      return () => clearTimeout(timer)
    }
    if (diff.isClose) return
    playWrongSound()
    incrementAttempts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, diff?.isPass, diff?.isClose, isQuiz])

  const handleListen = () => {
    reset()
    resetAttempts()
    autoRecordRef.current = true
    ttsWasActiveRef.current = false
    speak()
  }

  const handleSpeak = () => {
    reset()
    autoRecordRef.current = false
    ttsWasActiveRef.current = false
    startedAtRef.current = Date.now()
    start()
  }

  const handleRetry = () => {
    reset()
    autoRecordRef.current = false
    ttsWasActiveRef.current = false
    startedAtRef.current = Date.now()
    start()
  }

  if (!isSupported) {
    return (
      <div className="bg-card flex flex-col items-center gap-4 rounded-2xl border px-6 py-6 text-center">
        <p className="text-muted-foreground text-sm">{t('speakUnsupported')}</p>
        <Button onClick={() => onAnswer(true)}>{t('continueBtn')}</Button>
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

      {!isQuiz && status === 'done' && diff?.isPass && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-base font-semibold text-green-400"
        >
          {diff.isExact ? t('speechPerfect') : t('speechClose')}{' '}
          <span className="text-muted-foreground text-sm font-medium">
            {t('speechScore', { score: diff.displayScore })}
          </span>
        </motion.p>
      )}

      {!isQuiz && status === 'done' && diff && !diff.isPass && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ResultFeedback
            diff={diff}
            canBypass={canBypass}
            onRetry={handleRetry}
            onSkip={() => onAnswer(true)}
          />
        </motion.div>
      )}

      {isQuiz && status === 'done' && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-indigo-300"
        >
          {t('answerRecorded')}
        </motion.p>
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
