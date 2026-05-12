'use client'

import { useParams, useRouter } from 'next/navigation'

import { Skeleton } from '~/components/ui/skeleton'
import { useQuizQuickStartStore } from '~/stores/quiz-quick-start'
import { useReviewQuickStartStore } from '~/stores/review-quick-start'

import { HeroCelebrate } from './hero-celebrate'
import { HeroPhase } from './hero-phase'

import type { ReviewWord } from '~/types'
import type { ReviewVocab } from '~admin/review/_types/review.types'

const HERO_BATCH_LIMIT = 20
const MIN_BATCH = 1

interface SmartHeroCardProps {
  needsTestingCount: number
  needsTestingWords: ReviewWord[]
  unlearnedCount: number
  unlearnedWords: ReviewWord[]
  wrongTodayCount: number
  wrongTodayWords: ReviewWord[]
  masteredCount: number
  totalWords: number
  isLoading: boolean
  isViewMode?: boolean
}

function toReviewVocab(word: ReviewWord): ReviewVocab {
  return {
    id: word.id,
    word: word.word,
    meaning: word.meaning,
    word_type: word.word_type,
    phonetic: word.phonetic,
    example: word.example,
    synonyms: word.synonyms,
  }
}

export function SmartHeroCard(props: SmartHeroCardProps) {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const setPendingQuiz = useQuizQuickStartStore((s) => s.setPendingVocab)
  const setPendingReview = useReviewQuickStartStore((s) => s.setPendingVocab)

  if (props.isLoading) {
    return (
      <div className="border-border bg-card relative h-52.5 overflow-hidden rounded-2xl border p-7">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-12 w-40" />
        <Skeleton className="mt-3 h-4 w-72" />
        <Skeleton className="mt-6 h-10 w-56" />
      </div>
    )
  }

  const hasTest = props.needsTestingCount >= MIN_BATCH

  const goQuizWith = (words: ReviewWord[]) => {
    setPendingQuiz(words.slice(0, HERO_BATCH_LIMIT).map(toReviewVocab))
    router.push(`/${locale}/admin/quiz`)
  }
  const goReviewWith = (words: ReviewWord[]) => {
    setPendingReview(words.slice(0, HERO_BATCH_LIMIT).map(toReviewVocab))
    router.push(`/${locale}/admin/review`)
  }

  if (hasTest) {
    const batch = Math.min(props.needsTestingCount, HERO_BATCH_LIMIT)
    return (
      <HeroPhase
        track="test"
        total={props.needsTestingCount}
        batch={batch}
        onCta={() => goQuizWith(props.needsTestingWords)}
        isViewMode={props.isViewMode}
      />
    )
  }

  const hasLearn = props.unlearnedCount >= MIN_BATCH
  const hasNoProgress = props.masteredCount === 0 && hasLearn

  if (hasNoProgress) {
    return (
      <HeroPhase
        track="learn"
        total={props.unlearnedCount}
        batch={Math.min(props.unlearnedCount, HERO_BATCH_LIMIT)}
        onCta={() => goReviewWith(props.unlearnedWords)}
        isViewMode={props.isViewMode}
      />
    )
  }

  return (
    <HeroCelebrate
      wrongTodayCount={props.wrongTodayCount}
      unlearnedCount={props.unlearnedCount}
      onPracticeWrong={() => goReviewWith(props.wrongTodayWords)}
      onLearnNew={() => goReviewWith(props.unlearnedWords)}
      isViewMode={props.isViewMode}
    />
  )
}
