'use client'

import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Compass,
  Library,
  Play,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { useLessons } from '~/hooks/use-lessons'
import { useSoftDemoteMastery } from '~/hooks/use-word-mastery'
import { useQuizQuickStartStore } from '~/stores/quiz-quick-start'
import { useReviewQuickStartStore } from '~/stores/review-quick-start'
import { VocabularyDetailSheet } from '~admin/vocabularies/_components/vocabulary-detail-sheet'
import { VocabularyFilter } from '~admin/vocabularies/_components/vocabulary-filter'
import { VocabularyTable } from '~admin/vocabularies/_components/vocabulary-table'

import type { LucideIcon } from 'lucide-react'
import type { ReviewWord, Vocabulary } from '~/types'
import type { ReviewVocab } from '~admin/review/_types/review.types'

const ALL = 'all'

const TAB_KEYS = ['untouched', 'practicing', 'mastered'] as const
type TabKey = (typeof TAB_KEYS)[number]

type Accent = 'sky' | 'primary' | 'emerald'

interface TabVisual {
  icon: LucideIcon
  accent: Accent
  glow: string
  iconBg: string
  iconText: string
  border: string
  panelBg: string
  emptyIcon: LucideIcon
}

const TAB_VISUALS: Record<TabKey, TabVisual> = {
  untouched: {
    icon: Compass,
    accent: 'sky',
    glow: 'bg-sky-500/15',
    iconBg: 'bg-sky-500/15',
    iconText: 'text-sky-500',
    border: 'border-sky-500/25',
    panelBg: 'from-sky-500/[0.08] via-sky-500/[0.02] to-transparent',
    emptyIcon: Sparkles,
  },
  practicing: {
    icon: Brain,
    accent: 'primary',
    glow: 'bg-primary/15',
    iconBg: 'bg-primary/15',
    iconText: 'text-primary',
    border: 'border-primary/25',
    panelBg: 'from-primary/[0.08] via-primary/[0.02] to-transparent',
    emptyIcon: CheckCircle2,
  },
  mastered: {
    icon: Award,
    accent: 'emerald',
    glow: 'bg-emerald-500/15',
    iconBg: 'bg-emerald-500/15',
    iconText: 'text-emerald-500',
    border: 'border-emerald-500/25',
    panelBg: 'from-emerald-500/[0.08] via-emerald-500/[0.02] to-transparent',
    emptyIcon: Sparkles,
  },
}

interface WordsReviewViewProps {
  untouchedWords: ReviewWord[]
  practicingWords: ReviewWord[]
  masteredWords: ReviewWord[]
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

function isTabKey(value: string | null): value is TabKey {
  return value !== null && (TAB_KEYS as readonly string[]).includes(value)
}

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
  const [lessonFilter, setLessonFilter] = useState(ALL)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [viewingVoca, setViewingVoca] = useState<Vocabulary | null>(null)

  const sourceWords: Record<TabKey, ReviewWord[]> = {
    untouched: untouchedWords,
    practicing: practicingWords,
    mastered: masteredWords,
  }
  const activeWords = sourceWords[activeTab]
  const activeVisual = TAB_VISUALS[activeTab]

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return activeWords.filter((w) => {
      if (lessonFilter !== ALL && w.lesson_id !== lessonFilter) return false
      if (!q) return true
      return (
        w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q)
      )
    })
  }, [activeWords, lessonFilter, searchQuery])

  const isFiltering = lessonFilter !== ALL || searchQuery.trim() !== ''
  const hasFilteredWords = filtered.length > 0
  const sourceIsEmpty = activeWords.length === 0

  const handleTabChange = (value: string) => {
    if (!isTabKey(value)) return
    setActiveTab(value)
    setPage(1)
  }

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

  const handleBack = () => {
    router.push(`/${locale}/admin/dashboard`)
  }

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
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleBack}
          className="mt-1.5"
          title={t('back')}
        >
          <ArrowLeft size={16} />
        </Button>
        <div className="bg-muted text-primary mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <Library size={18} strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground text-2xl font-[590] tracking-[-0.5px]">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {t('subtitle')}
          </p>
        </div>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-5"
      >
        <TabsList className="bg-muted/60 h-auto w-full justify-start gap-1 rounded-xl p-1">
          <TabTrigger
            value="untouched"
            label={t('tabs.untouched')}
            count={untouchedWords.length}
            isActive={activeTab === 'untouched'}
            visual={TAB_VISUALS.untouched}
          />
          <TabTrigger
            value="practicing"
            label={t('tabs.practicing')}
            count={practicingWords.length}
            isActive={activeTab === 'practicing'}
            visual={TAB_VISUALS.practicing}
          />
          <TabTrigger
            value="mastered"
            label={t('tabs.mastered')}
            count={masteredWords.length}
            isActive={activeTab === 'mastered'}
            visual={TAB_VISUALS.mastered}
          />
        </TabsList>

        <TabsContent value="untouched">
          <ActionPanel
            visual={TAB_VISUALS.untouched}
            headline={t('panel.untouched.headline', {
              count: untouchedWords.length,
            })}
            description={t('panel.untouched.description')}
            primaryCta={{
              label: t('actions.testNow'),
              icon: Play,
              count: filtered.length,
              onClick: () => startQuiz(filtered),
              disabled: !hasFilteredWords,
            }}
            secondaryCta={{
              label: t('actions.reviewFirst'),
              icon: BookOpen,
              onClick: () => startReview(filtered),
              disabled: !hasFilteredWords,
            }}
          />
        </TabsContent>

        <TabsContent value="practicing">
          <ActionPanel
            visual={TAB_VISUALS.practicing}
            headline={t('panel.practicing.headline', {
              count: practicingWords.length,
            })}
            description={t('panel.practicing.description')}
            primaryCta={{
              label: t('actions.reviewAgain'),
              icon: RotateCcw,
              count: filtered.length,
              onClick: () => startReview(filtered),
              disabled: !hasFilteredWords,
            }}
          />
        </TabsContent>

        <TabsContent value="mastered">
          <ActionPanel
            visual={TAB_VISUALS.mastered}
            headline={t('panel.mastered.headline', {
              count: masteredWords.length,
            })}
            description={t('panel.mastered.description')}
            primaryCta={{
              label: t('actions.reviewAgain'),
              icon: RotateCcw,
              count: filtered.length,
              onClick: () => startReview(filtered),
              disabled: !hasFilteredWords,
            }}
          />
        </TabsContent>

        <div className="space-y-4">
          {!sourceIsEmpty && (
            <VocabularyFilter
              lessons={lessons}
              lessonFilter={lessonFilter}
              searchQuery={searchQuery}
              onLessonChange={handleLessonChange}
              onSearchChange={handleSearchChange}
              onClearFilters={handleClearFilters}
            />
          )}

          {sourceIsEmpty && !isLoading ? (
            <TabEmptyState
              visual={activeVisual}
              message={t(`empty.${activeTab}` as const)}
            />
          ) : !hasFilteredWords && isFiltering && !isLoading ? (
            <NoMatchState onClear={handleClearFilters} />
          ) : (
            <div className="border-border bg-card/40 overflow-hidden rounded-xl border">
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
                renderRowActions={
                  activeTab === 'mastered'
                    ? (voca) => (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground hover:bg-muted h-7 gap-1.5 border border-white/[0.06] text-xs"
                          onClick={() => handleUnmaster(voca)}
                          disabled={softDemote.isPending}
                        >
                          <RotateCcw size={11} />
                          {t('actions.unmaster')}
                        </Button>
                      )
                    : undefined
                }
              />
            </div>
          )}
        </div>
      </Tabs>

      <VocabularyDetailSheet
        voca={viewingVoca}
        lessons={lessons}
        onClose={() => setViewingVoca(null)}
      />
    </div>
  )
}

interface TabTriggerProps {
  value: TabKey
  label: string
  count: number
  isActive: boolean
  visual: TabVisual
}

function TabTrigger({
  value,
  label,
  count,
  isActive,
  visual,
}: TabTriggerProps) {
  const Icon = visual.icon
  return (
    <TabsTrigger
      value={value}
      className="data-active:bg-background flex h-9 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-[510] data-active:shadow-sm"
    >
      <Icon
        size={14}
        strokeWidth={2}
        className={isActive ? visual.iconText : 'text-muted-foreground'}
      />
      <span>{label}</span>
      <span
        className={
          isActive
            ? `${visual.iconBg} ${visual.iconText} rounded-full px-1.5 py-px text-[10px] font-[590] tabular-nums`
            : 'bg-muted text-muted-foreground rounded-full px-1.5 py-px text-[10px] font-[590] tabular-nums'
        }
      >
        {count}
      </span>
    </TabsTrigger>
  )
}

interface CtaConfig {
  label: string
  icon: LucideIcon
  count?: number
  onClick: () => void
  disabled?: boolean
}

interface ActionPanelProps {
  visual: TabVisual
  headline: string
  description: string
  primaryCta: CtaConfig
  secondaryCta?: CtaConfig
}

function ActionPanel({
  visual,
  headline,
  description,
  primaryCta,
  secondaryCta,
}: ActionPanelProps) {
  const Icon = visual.icon
  const PrimaryIcon = primaryCta.icon
  const SecondaryIcon = secondaryCta?.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 ${visual.border} ${visual.panelBg}`}
    >
      <motion.div
        className={`pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full blur-3xl ${visual.glow}`}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${visual.iconBg} ${visual.iconText}`}
          >
            <Icon size={22} strokeWidth={1.8} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-foreground text-lg leading-tight font-[590] tracking-[-0.3px] sm:text-xl">
              {headline}
            </h2>
            <p className="text-muted-foreground mt-1.5 max-w-md text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <motion.div
            whileHover={primaryCta.disabled ? {} : { scale: 1.02 }}
            whileTap={primaryCta.disabled ? {} : { scale: 0.98 }}
          >
            <Button
              size="default"
              onClick={primaryCta.onClick}
              disabled={primaryCta.disabled}
              className="gap-2"
            >
              <PrimaryIcon size={14} />
              {primaryCta.label}
              {primaryCta.count !== undefined && (
                <span className="bg-primary-foreground/15 rounded px-1.5 py-px text-[11px] font-[590] tabular-nums">
                  {primaryCta.count}
                </span>
              )}
              <ArrowRight size={14} className="opacity-70" />
            </Button>
          </motion.div>

          {secondaryCta && SecondaryIcon && (
            <Button
              variant="outline"
              size="default"
              onClick={secondaryCta.onClick}
              disabled={secondaryCta.disabled}
              className="gap-2"
            >
              <SecondaryIcon size={14} />
              {secondaryCta.label}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

interface TabEmptyStateProps {
  visual: TabVisual
  message: string
}

function TabEmptyState({ visual, message }: TabEmptyStateProps) {
  const Icon = visual.emptyIcon
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-border bg-card/40 flex flex-col items-center justify-center gap-4 rounded-xl border px-6 py-16 text-center"
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${visual.iconBg} ${visual.iconText}`}
      >
        <Icon size={26} strokeWidth={1.8} />
      </div>
      <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
        {message}
      </p>
    </motion.div>
  )
}

interface NoMatchStateProps {
  onClear: () => void
}

function NoMatchState({ onClear }: NoMatchStateProps) {
  const t = useTranslations('DashboardWords')
  return (
    <div className="border-border bg-card/40 flex flex-col items-center justify-center gap-3 rounded-xl border px-6 py-14 text-center">
      <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-xl">
        <Search size={20} strokeWidth={1.8} />
      </div>
      <p className="text-muted-foreground text-sm">{t('noMatch')}</p>
      <Button variant="outline" size="sm" onClick={onClear}>
        {t('clearFilters')}
      </Button>
    </div>
  )
}
