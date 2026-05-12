'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '~/components/ui/badge'
import { dayjs } from '~/lib/dayjs'
import {
  GRADE_AGAIN,
  GRADE_EASY,
  GRADE_GOOD,
  GRADE_HARD,
} from '~/lib/mastery-scheduler'

import { LevelDots } from './level-dots'

import type { MasteryStatus, WordMastery } from '~/types'

const STATUS_BADGE: Record<
  MasteryStatus,
  { label: string; className: string }
> = {
  mastered: {
    label: 'statusMastered',
    className:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10',
  },
  practicing: {
    label: 'statusPracticing',
    className:
      'border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/10',
  },
  untested: {
    label: 'statusUntested',
    className:
      'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/5',
  },
}

const GRADE_LABEL: Record<number, string> = {
  [GRADE_AGAIN]: 'gradeAgain',
  [GRADE_HARD]: 'gradeHard',
  [GRADE_GOOD]: 'gradeGood',
  [GRADE_EASY]: 'gradeEasy',
}

const GRADE_COLOR: Record<number, string> = {
  [GRADE_AGAIN]: 'text-red-400',
  [GRADE_HARD]: 'text-amber-400',
  [GRADE_GOOD]: 'text-blue-400',
  [GRADE_EASY]: 'text-emerald-400',
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  const d = dayjs(iso)
  if (!d.isValid()) return '—'
  return `${d.format('DD/MM/YYYY HH:mm')} · ${d.fromNow()}`
}

interface StatCellProps {
  label: string
  value: React.ReactNode
  valueClass?: string
}

function StatCell({ label, value, valueClass }: StatCellProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
        {label}
      </span>
      <span
        className={`text-sm font-semibold tabular-nums ${valueClass ?? ''}`}
      >
        {value}
      </span>
    </div>
  )
}

interface VocabularyDetailMasteryProps {
  mastery: WordMastery | null
  masteryStatus: MasteryStatus
}

export function VocabularyDetailMastery({
  mastery,
  masteryStatus,
}: VocabularyDetailMasteryProps) {
  const t = useTranslations('Vocabularies')
  const badge = STATUS_BADGE[masteryStatus]

  if (!mastery) {
    return (
      <div className="rounded-lg border border-white/8 bg-white/3 px-4 py-3">
        <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {t('detailMasterySection')}
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          {t('detailNotTested')}
        </p>
      </div>
    )
  }

  const lastGradeKey = mastery.last_grade
    ? GRADE_LABEL[mastery.last_grade]
    : null
  const lastGradeColor = mastery.last_grade
    ? GRADE_COLOR[mastery.last_grade]
    : ''

  return (
    <div className="space-y-3 rounded-lg border border-white/8 bg-white/3 px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
          {t('detailMasterySection')}
        </p>
        <Badge
          variant="outline"
          className={`text-[11px] font-normal ${badge.className}`}
        >
          {t(badge.label as Parameters<typeof t>[0])}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">
          {t('detailLevel')}
        </span>
        <LevelDots level={mastery.level} size="md" />
      </div>

      <div className="grid grid-cols-4 gap-3 border-t border-white/6 pt-3">
        <StatCell
          label={t('detailCorrectCount')}
          value={mastery.correct_count}
          valueClass="text-emerald-400"
        />
        <StatCell
          label={t('detailWrongCount')}
          value={mastery.wrong_count}
          valueClass="text-red-400"
        />
        <StatCell label={t('detailLapses')} value={mastery.lapse_count} />
        <StatCell
          label={t('detailLastGrade')}
          value={
            lastGradeKey ? t(lastGradeKey as Parameters<typeof t>[0]) : '—'
          }
          valueClass={lastGradeColor}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 border-t border-white/6 pt-3">
        <StatCell
          label={t('detailStability')}
          value={`${mastery.stability.toFixed(1)}d`}
        />
        <StatCell
          label={t('detailDifficulty')}
          value={`${mastery.difficulty.toFixed(1)} / 10`}
        />
        <StatCell
          label={t('detailEase')}
          value={mastery.ease_factor.toFixed(2)}
        />
      </div>

      <div className="space-y-1.5 border-t border-white/6 pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{t('detailTested')}</span>
          <span className="text-foreground/80">
            {formatDate(mastery.tested_at)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{t('colDue')}</span>
          <span className="text-foreground/80">
            {formatDate(mastery.due_at)}
          </span>
        </div>
      </div>
    </div>
  )
}
