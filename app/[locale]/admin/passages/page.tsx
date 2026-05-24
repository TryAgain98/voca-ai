'use client'

import { useUser } from '@clerk/nextjs'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import { useDeletePassage, usePassages } from '~/hooks/use-passages'

import { PassageCard } from './_components/passage-card'

export default function PassagesPage() {
  const t = useTranslations('Passages')
  const locale = useLocale()
  const { user } = useUser()
  const userId = user?.id ?? ''

  const { data: passages = [], isLoading } = usePassages(userId)
  const deletePassage = useDeletePassage()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('description')}
          </p>
        </div>
        <Link href={`/${locale}/admin/passages/new`}>
          <Button className="gap-2">
            <Plus size={16} />
            {t('new')}
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            />
          ))}
        </div>
      )}

      {!isLoading && passages.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="text-[#d0d6e0]">{t('empty')}</p>
          <p className="text-sm text-[#8a8f98]">{t('emptyHint')}</p>
          <Link href={`/${locale}/admin/passages/new`}>
            <Button variant="outline" className="mt-2 gap-2">
              <Plus size={16} />
              {t('new')}
            </Button>
          </Link>
        </div>
      )}

      {!isLoading && passages.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {passages.map((p) => (
            <PassageCard
              key={p.id}
              passage={p}
              onDelete={(id) => deletePassage.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
