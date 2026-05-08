'use client'

import { useUser } from '@clerk/nextjs'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

import { useLessons } from '~/hooks/use-lessons'
import { useSoftDemoteMastery } from '~/hooks/use-word-mastery'
import { useQuizQuickStartStore } from '~/stores/quiz-quick-start'
import { useReviewQuickStartStore } from '~/stores/review-quick-start'
import { VocabularyDetailSheet } from '~admin/vocabularies/_components/vocabulary-detail-sheet'

import { useTabCtas } from '../_hooks/use-tab-ctas'
import { isTabKey } from '../_types/words-review.types'

import { WordsReviewContent } from './words-review-content'
import { WordsReviewHeader } from './words-review-header'
import { WordsReviewToolbar } from './words-review-toolbar'

import type { TabKey } from '../_types/words-review.types'
import type { ReviewWord, Vocabulary } from '~/types'
import type { ReviewVocab } from '~admin/review/_types/review.types'

interface WordsReviewViewProps {
  untouchedWords: ReviewWord[]
  practicingWords: ReviewWord[]
  masteredWords: ReviewWord[]
  isLoading: boolean
}

const toReviewVocab = (w: ReviewWord): ReviewVocab => ({
  id: w.id,
  word: w.word,
  meaning: w.meaning,
  word_type: w.word_type,
  phonetic: w.phonetic,
  example: w.example,
})

export function WordsReviewView({
  untouchedWords,
  practicingWords,
  masteredWords,
  isLoading,
}: WordsReviewViewProps) {
  const t = useTranslations('DashboardWords')
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = params.locale as string
  const { user } = useUser()

  const setPendingReview = useReviewQuickStartStore((s) => s.setPendingVocab)
  const setPendingQuiz = useQuizQuickStartStore((s) => s.setPendingVocab)
  const softDemote = useSoftDemoteMastery()

  const initialTab = isTabKey(searchParams.get('tab'))
    ? (searchParams.get('tab') as TabKey)
    : 'untouched'
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)

  const { data: lessons = [] } = useLessons()
  const [page, setPage] = useState(1)
  const [viewingVoca, setViewingVoca] = useState<Vocabulary | null>(null)

  const sourceWords: Record<TabKey, ReviewWord[]> = {
    untouched: untouchedWords,
    practicing: practicingWords,
    mastered: masteredWords,
  }
  const activeWords = sourceWords[activeTab]
  const totalCount =
    untouchedWords.length + practicingWords.length + masteredWords.length

  const hasWords = activeWords.length > 0
  const sourceIsEmpty = !hasWords

  const startQuiz = (words: ReviewWord[]) => {
    if (words.length === 0) return
    setPendingQuiz(words.map(toReviewVocab))
    router.push(`/${locale}/admin/quiz`)
  }

  const startReview = (words: ReviewWord[]) => {
    if (words.length === 0) return
    setPendingReview(words.map(toReviewVocab))
    router.push(`/${locale}/admin/review`)
  }

  const ctas = useTabCtas({
    activeTab,
    filteredCount: activeWords.length,
    hasFilteredWords: hasWords,
    onStartQuiz: () => startQuiz(activeWords),
    onStartReview: () => startReview(activeWords),
  })

  const handleTabChange = (value: TabKey) => {
    setActiveTab(value)
    setPage(1)
  }

  const handleBack = () => {
    router.push(`/${locale}/admin/dashboard`)
  }

  const handleUnmaster = (voca: Vocabulary) => {
    if (!user?.id) return
    softDemote.mutate(
      { userId: user.id, wordId: voca.id },
      {
        onSuccess: () => {
          toast.success(t('unmasterToast', { word: voca.word }))
        },
      },
    )
  }

  return (
    <div className="space-y-3">
      <div className="bg-background/85 supports-[backdrop-filter]:bg-background/75 top-0 z-20 -mx-4 space-y-2 px-4 py-2.5 backdrop-blur-md sm:-mx-6 sm:px-6">
        <WordsReviewHeader totalCount={totalCount} onBack={handleBack} />

        <WordsReviewToolbar
          activeTab={activeTab}
          counts={{
            untouched: untouchedWords.length,
            practicing: practicingWords.length,
            mastered: masteredWords.length,
          }}
          primaryCta={ctas.primary}
          secondaryCta={ctas.secondary}
          onTabChange={handleTabChange}
        />
      </div>

      <WordsReviewContent
        activeTab={activeTab}
        description={t(`panel.${activeTab}.description` as const)}
        words={activeWords}
        lessons={lessons}
        page={page}
        isLoading={isLoading}
        sourceIsEmpty={sourceIsEmpty}
        isUnmasterPending={softDemote.isPending}
        onPageChange={setPage}
        onRowClick={setViewingVoca}
        onUnmaster={handleUnmaster}
      />

      <VocabularyDetailSheet
        voca={viewingVoca}
        lessons={lessons}
        onClose={() => setViewingVoca(null)}
      />
    </div>
  )
}
