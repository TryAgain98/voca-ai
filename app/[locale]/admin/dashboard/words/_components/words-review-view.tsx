'use client'

import { ArrowLeft, ArrowRight, Clock, Layers } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { Button } from '~/components/ui/button'
import { useLessons } from '~/hooks/use-lessons'
import { useReviewQuickStartStore } from '~/stores/review-quick-start'
import { VocabularyDetailSheet } from '~admin/vocabularies/_components/vocabulary-detail-sheet'
import { VocabularyFilter } from '~admin/vocabularies/_components/vocabulary-filter'
import { VocabularyTable } from '~admin/vocabularies/_components/vocabulary-table'

import type { ReviewWord, Vocabulary } from '~/types'
import type { ReviewVocab } from '~admin/review/_types/review.types'

const ALL = 'all'
const MIN_REVIEW_WORDS = 4

export type WordsViewType = 'unlearned' | 'due'

interface WordsReviewViewProps {
  type: WordsViewType
  words: ReviewWord[]
  isLoading: boolean
}

function toReviewVocab(word: ReviewWord): ReviewVocab {
  return {
    id: word.id,
    word: word.word,
    meaning: word.meaning,
    word_type: word.word_type,
    phonetic: word.phonetic,
    example: word.example,
  }
}

export function WordsReviewView({
  type,
  words,
  isLoading,
}: WordsReviewViewProps) {
  const t = useTranslations('DashboardWords')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const setPendingVocab = useReviewQuickStartStore((s) => s.setPendingVocab)

  const { data: lessons = [] } = useLessons()
  const [lessonFilter, setLessonFilter] = useState(ALL)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [viewingVoca, setViewingVoca] = useState<Vocabulary | null>(null)

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return words.filter((w) => {
      if (lessonFilter !== ALL && w.lesson_id !== lessonFilter) return false
      if (!q) return true
      return (
        w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q)
      )
    })
  }, [words, lessonFilter, searchQuery])

  const isFiltering = lessonFilter !== ALL || searchQuery.trim() !== ''
  const canStartReview = filtered.length >= MIN_REVIEW_WORDS

  const handleLessonChange = (value: string) => {
    setLessonFilter(value)
    setPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  const handleClearFilters = () => {
    setLessonFilter(ALL)
    setSearchQuery('')
    setPage(1)
  }

  const handleStartReview = () => {
    if (!canStartReview) return
    setPendingVocab(filtered.map(toReviewVocab))
    router.push(`/${locale}/admin/review`)
  }

  const handleBack = () => {
    router.push(`/${locale}/admin/dashboard`)
  }

  const Icon = type === 'unlearned' ? Layers : Clock
  const titleKey = type === 'unlearned' ? 'unlearnedTitle' : 'dueTitle'
  const subtitleKey = type === 'unlearned' ? 'unlearnedSubtitle' : 'dueSubtitle'
  const startKey = type === 'unlearned' ? 'startLearning' : 'reviewNow'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleBack}
            className="mt-1.5"
            title={t('back')}
          >
            <ArrowLeft size={16} />
          </Button>
          <div className="flex items-start gap-3">
            <div className="bg-muted text-primary mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <Icon size={18} strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-2xl font-[590] tracking-[-0.5px]">
                {t(titleKey)}
              </h1>
              <p className="text-muted-foreground mt-0.5 text-sm">
                {t(subtitleKey, { count: words.length })}
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleStartReview}
          disabled={!canStartReview}
          className="gap-2"
        >
          {t(startKey)}
          <ArrowRight size={14} />
        </Button>
      </div>

      <VocabularyFilter
        lessons={lessons}
        lessonFilter={lessonFilter}
        searchQuery={searchQuery}
        onLessonChange={handleLessonChange}
        onSearchChange={handleSearchChange}
        onClearFilters={handleClearFilters}
      />

      {!canStartReview && filtered.length > 0 && (
        <p className="text-muted-foreground text-xs">
          {t('notEnoughWords', { min: MIN_REVIEW_WORDS })}
        </p>
      )}

      <div className="rounded-xl border">
        <VocabularyTable
          vocabularies={filtered}
          lessons={lessons}
          searchQuery={searchQuery}
          isLoading={isLoading}
          isFiltering={isFiltering}
          page={page}
          onPageChange={setPage}
          onRowClick={setViewingVoca}
          onClearFilters={handleClearFilters}
        />
      </div>

      <VocabularyDetailSheet
        voca={viewingVoca}
        lessons={lessons}
        onClose={() => setViewingVoca(null)}
      />
    </div>
  )
}
