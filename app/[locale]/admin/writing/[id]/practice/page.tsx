'use client'

import { useUser } from '@clerk/nextjs'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import {
  useUserWritingAttempt,
  useSubmitWritingAttempt,
} from '~/hooks/use-writing-attempts'
import { useWritingExercise } from '~/hooks/use-writing-exercises'

import { WritingInput } from './_components/writing-input'
import { WritingResult } from './_components/writing-result'

import type { WritingScoreResult } from '~/providers/ai/types'
import type { WritingAttempt } from '~/types'

function attemptToScoreResult(attempt: WritingAttempt): WritingScoreResult {
  return {
    grammar_score: attempt.grammar_score,
    grammar_feedback: {
      en: attempt.grammar_feedback,
      vi: attempt.grammar_feedback_vi ?? attempt.grammar_feedback,
    },
    relevance_score: attempt.relevance_score,
    relevance_feedback: {
      en: attempt.relevance_feedback,
      vi: attempt.relevance_feedback_vi ?? attempt.relevance_feedback,
    },
    improved_sentence: attempt.improved_sentence,
    ideal_sentence: attempt.ideal_sentence,
    ideal_sentence_vi: attempt.ideal_sentence_vi ?? '',
  }
}

export default function WritingPracticePage() {
  const t = useTranslations('Writing')
  const locale = useLocale()
  const params = useParams<{ id: string }>()
  const { user } = useUser()
  const userId = user?.id ?? ''

  const { data: exercise, isLoading: exerciseLoading } = useWritingExercise(
    params.id,
  )
  const { data: lastAttempt } = useUserWritingAttempt(params.id, userId)
  const submitAttempt = useSubmitWritingAttempt()

  const [sentence, setSentence] = useState('')
  const [newResult, setNewResult] = useState<WritingScoreResult | null>(null)
  const [submittedSentence, setSubmittedSentence] = useState('')
  const [isRedoing, setIsRedoing] = useState(false)

  const isViewingPrevious = !isRedoing && !!lastAttempt && !newResult
  const displayResult =
    newResult ?? (isViewingPrevious ? attemptToScoreResult(lastAttempt) : null)
  const displaySentence =
    submittedSentence || (isViewingPrevious ? lastAttempt.user_sentence : '')

  async function handleSubmit(): Promise<void> {
    if (!exercise || !sentence.trim()) return

    const saved = sentence
    setSubmittedSentence(saved)

    try {
      const res = await submitAttempt.mutateAsync({
        exerciseId: exercise.id,
        userId,
        imageUrl: exercise.image_url,
        keywords: exercise.keywords,
        userSentence: saved,
      })
      setNewResult(res.scoreResult)
    } catch {
      // Error toast shown by the hook
    }
  }

  function handleRetry(): void {
    setNewResult(null)
    setIsRedoing(true)
    setSentence('')
    setSubmittedSentence('')
  }

  if (exerciseLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 size={28} className="text-muted-foreground animate-spin" />
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-muted-foreground">{t('exerciseNotFound')}</p>
        <Link href={`/${locale}/admin/writing`}>
          <Button variant="outline">{t('backToList')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/admin/writing`}>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-8"
          >
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-lg leading-6 font-semibold tracking-tight">
            {exercise.title}
          </h1>
          {lastAttempt && (
            <p className="text-muted-foreground text-xs">
              {t('previousScore', {
                score: Math.round(
                  (lastAttempt.grammar_score + lastAttempt.relevance_score) / 2,
                ),
              })}
            </p>
          )}
        </div>
      </div>

      <div className="relative h-64 w-full overflow-hidden rounded-2xl sm:h-80">
        <Image
          src={exercise.image_url}
          alt={exercise.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="border-border bg-card rounded-2xl border p-5">
        <p className="text-muted-foreground mb-4 text-sm">
          {t('practiceInstruction')}
        </p>

        {displayResult ? (
          <WritingResult
            result={displayResult}
            userSentence={displaySentence}
            isViewingPrevious={isViewingPrevious}
            onRetry={handleRetry}
          />
        ) : (
          <WritingInput
            sentence={sentence}
            keywords={exercise.keywords}
            isSubmitting={submitAttempt.isPending}
            onChange={setSentence}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  )
}
