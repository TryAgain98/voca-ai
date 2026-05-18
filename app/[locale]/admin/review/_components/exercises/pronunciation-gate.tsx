'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Mic, Volume2, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '~/components/ui/button'
import { useSpeechRecognition } from '~/hooks/use-speech-recognition'
import { useTTS } from '~/hooks/use-tts'
import { cn } from '~/lib/cn'

import { buildSpeechDiff } from './_utils/phoneme-diff'

const MAX_ATTEMPTS = 3
const TTS_AUTO_DELAY_MS = 350
const AUTO_RECORD_DELAY_MS = 250
const PASS_ADVANCE_DELAY_MS = 450
const FAIL_ADVANCE_DELAY_MS = 600
const RETRY_AUDIO_DELAY_MS = 600

interface PronunciationGateProps {
  word: string
  phonetic?: string | null
  onResult: (passed: boolean) => void
}

export function PronunciationGate({
  word,
  phonetic,
  onResult,
}: PronunciationGateProps) {
  const t = useTranslations('Review')
  const { speak, isSpeaking, isLoading } = useTTS(word)
  const { status, transcript, alternatives, start, reset, isSupported } =
    useSpeechRecognition()
  const [attempts, setAttempts] = useState(0)
  const autoRecordRef = useRef(true)
  const ttsWasActiveRef = useRef(false)
  const completedRef = useRef(false)

  const isTTSActive = isSpeaking || isLoading

  const incrementAttempts = useCallback(() => {
    setAttempts((prev) => prev + 1)
  }, [])

  useEffect(() => {
    if (isSupported || completedRef.current) return
    completedRef.current = true
    onResult(true)
  }, [isSupported, onResult])

  useEffect(() => {
    if (!isSupported) return
    const timer = setTimeout(speak, TTS_AUTO_DELAY_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isSupported) return
    if (isTTSActive) {
      ttsWasActiveRef.current = true
      return
    }
    if (!ttsWasActiveRef.current || !autoRecordRef.current) return
    ttsWasActiveRef.current = false
    autoRecordRef.current = false
    const timer = setTimeout(start, AUTO_RECORD_DELAY_MS)
    return () => clearTimeout(timer)
  }, [isSupported, isTTSActive, start])

  const diff = useMemo(
    () =>
      status === 'done'
        ? buildSpeechDiff(
            word,
            alternatives.length > 0 ? alternatives : transcript,
          )
        : null,
    [alternatives, status, transcript, word],
  )

  useEffect(() => {
    if (completedRef.current || status !== 'done' || !diff) return

    if (diff.isPass) {
      completedRef.current = true
      const timer = setTimeout(() => onResult(true), PASS_ADVANCE_DELAY_MS)
      return () => clearTimeout(timer)
    }

    if (diff.isClose) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    incrementAttempts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, diff?.isPass, diff?.isClose])

  useEffect(() => {
    if (attempts === 0 || completedRef.current) return

    if (attempts >= MAX_ATTEMPTS) {
      completedRef.current = true
      const timer = setTimeout(() => onResult(false), FAIL_ADVANCE_DELAY_MS)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      reset()
      autoRecordRef.current = true
      ttsWasActiveRef.current = false
      speak()
    }, RETRY_AUDIO_DELAY_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempts])

  const handleManualListen = () => {
    reset()
    autoRecordRef.current = true
    ttsWasActiveRef.current = false
    speak()
  }

  const handleManualSpeak = () => {
    reset()
    autoRecordRef.current = false
    ttsWasActiveRef.current = false
    start()
  }

  if (!isSupported) return null

  const isPass = diff?.isPass === true
  const isFinalFail =
    status === 'done' && diff && !diff.isPass && attempts >= MAX_ATTEMPTS
  const isWrongAttempt =
    status === 'done' && diff && !diff.isPass && !diff.isClose && !isFinalFail
  const remaining = Math.max(0, MAX_ATTEMPTS - attempts)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-3 rounded-2xl border border-indigo-500/25 bg-indigo-500/4 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-foreground text-lg font-[590] tracking-tight">
            {word}
          </p>
          {phonetic && (
            <p className="text-muted-foreground font-mono text-xs">
              {phonetic}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleManualListen}
          disabled={isTTSActive}
          className="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 transition-colors hover:border-white/20 disabled:opacity-50"
          aria-label={t('listenBtn')}
        >
          <Volume2
            size={16}
            className={cn(isTTSActive && 'animate-pulse text-emerald-400')}
          />
        </button>
      </div>

      <div className="flex min-h-9 items-center justify-center gap-2 text-sm">
        {status === 'listening' && (
          <>
            <Mic size={15} className="animate-pulse text-red-400" />
            <span className="text-muted-foreground">{t('listeningLabel')}</span>
          </>
        )}
        {isPass && (
          <>
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span className="font-[510] text-emerald-300">
              {t('pronGatePass')}
            </span>
          </>
        )}
        {isWrongAttempt && (
          <>
            <XCircle size={16} className="text-amber-400" />
            <span className="text-amber-300">
              {t('pronGateRetry', { remaining })}
            </span>
          </>
        )}
        {isFinalFail && (
          <>
            <XCircle size={16} className="text-red-400" />
            <span className="text-red-300">{t('pronGateFinalFail')}</span>
          </>
        )}
        {status === 'error' && !isFinalFail && (
          <span className="text-muted-foreground text-xs">
            {t('speakError')}
          </span>
        )}
      </div>

      {(status === 'idle' || status === 'error') && (
        <Button
          variant="outline"
          onClick={handleManualSpeak}
          disabled={isTTSActive}
          className="h-10 w-full gap-2"
        >
          <Mic size={14} />
          {t('speakBtn')}
        </Button>
      )}

      <div className="text-muted-foreground/70 flex items-center justify-between text-xs">
        <span>{t('pronGateInstruction')}</span>
        <span className="font-mono">
          {attempts}/{MAX_ATTEMPTS}
        </span>
      </div>
    </motion.div>
  )
}
