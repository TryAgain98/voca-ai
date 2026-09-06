'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { cn } from '~/lib/cn'

interface PlanTabsNavProps {
  active: 'long-term' | 'daily' | 'templates'
}

export function PlanTabsNav({ active }: PlanTabsNavProps) {
  const t = useTranslations('Plans')
  const params = useParams()
  const locale = params.locale as string

  const tabs = [
    {
      key: 'long-term' as const,
      href: '/admin/plans/long-term',
      label: t('longTermTab'),
    },
    { key: 'daily' as const, href: '/admin/plans', label: t('dailyTab') },
    {
      key: 'templates' as const,
      href: '/admin/plans/templates',
      label: t('templatesTab'),
    },
  ]

  return (
    <div className="border-border flex w-fit gap-1 rounded-md border p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`/${locale}${tab.href}`}
          className={cn(
            'rounded-[4px] px-3 py-1.5 text-sm transition-colors',
            active === tab.key
              ? 'bg-accent text-accent-foreground font-[510]'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
