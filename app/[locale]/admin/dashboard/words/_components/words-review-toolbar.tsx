'use client'

import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'

import { TAB_KEYS, TAB_VISUALS } from '../_types/words-review.types'

import type { CtaConfig, TabKey, TabVisual } from '../_types/words-review.types'

interface WordsReviewToolbarProps {
  activeTab: TabKey
  counts: Record<TabKey, number>
  primaryCta: CtaConfig
  secondaryCta?: CtaConfig
  onTabChange: (value: TabKey) => void
}

export function WordsReviewToolbar({
  activeTab,
  counts,
  primaryCta,
  secondaryCta,
  onTabChange,
}: WordsReviewToolbarProps) {
  const tDash = useTranslations('DashboardWords')
  const PrimaryIcon = primaryCta.icon
  const SecondaryIcon = secondaryCta?.icon

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as TabKey)}
      className="contents"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <TabsList className="bg-muted/60 h-auto gap-1 rounded-lg p-1">
          {TAB_KEYS.map((key) => (
            <ToolbarTabTrigger
              key={key}
              value={key}
              label={tDash(`tabs.${key}` as const)}
              count={counts[key]}
              isActive={activeTab === key}
              visual={TAB_VISUALS[key]}
            />
          ))}
        </TabsList>

        <div className="ml-auto flex items-center gap-2">
          {secondaryCta && SecondaryIcon && (
            <Button
              variant="outline"
              size="sm"
              onClick={secondaryCta.onClick}
              disabled={secondaryCta.disabled}
              className="h-9 gap-1.5"
            >
              <SecondaryIcon size={14} />
              <span className="hidden sm:inline">{secondaryCta.label}</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={primaryCta.onClick}
            disabled={primaryCta.disabled}
            className="h-9 gap-1.5"
          >
            <PrimaryIcon size={14} />
            {primaryCta.label}
            {primaryCta.count !== undefined && (
              <span className="bg-primary-foreground/15 rounded px-1.5 py-px text-[11px] font-[590] tabular-nums">
                {primaryCta.count}
              </span>
            )}
            <ArrowRight size={13} className="opacity-70" />
          </Button>
        </div>
      </div>
    </Tabs>
  )
}

interface ToolbarTabTriggerProps {
  value: TabKey
  label: string
  count: number
  isActive: boolean
  visual: TabVisual
}

function ToolbarTabTrigger({
  value,
  label,
  count,
  isActive,
  visual,
}: ToolbarTabTriggerProps) {
  const Icon = visual.icon
  return (
    <TabsTrigger
      value={value}
      className="data-active:bg-background flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-[510] data-active:shadow-sm"
    >
      <Icon
        size={13}
        strokeWidth={2}
        className={isActive ? visual.iconText : 'text-muted-foreground'}
      />
      <span className="hidden sm:inline">{label}</span>
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
