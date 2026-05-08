import { BookOpen, Play, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'

import type { CtaConfig, TabKey } from '../_types/words-review.types'

interface UseTabCtasParams {
  activeTab: TabKey
  filteredCount: number
  hasFilteredWords: boolean
  onStartQuiz: () => void
  onStartReview: () => void
}

interface UseTabCtasReturn {
  primary: CtaConfig
  secondary?: CtaConfig
}

export function useTabCtas({
  activeTab,
  filteredCount,
  hasFilteredWords,
  onStartQuiz,
  onStartReview,
}: UseTabCtasParams): UseTabCtasReturn {
  const t = useTranslations('DashboardWords')

  if (activeTab === 'untouched') {
    return {
      primary: {
        label: t('actions.testNow'),
        icon: Play,
        count: filteredCount,
        onClick: onStartQuiz,
        disabled: !hasFilteredWords,
      },
      secondary: {
        label: t('actions.reviewFirst'),
        icon: BookOpen,
        onClick: onStartReview,
        disabled: !hasFilteredWords,
      },
    }
  }

  return {
    primary: {
      label: t('actions.reviewAgain'),
      icon: RotateCcw,
      count: filteredCount,
      onClick: onStartReview,
      disabled: !hasFilteredWords,
    },
  }
}
