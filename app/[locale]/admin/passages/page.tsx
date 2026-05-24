'use client'

import { useUser } from '@clerk/nextjs'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import { useLatestExamsByUser } from '~/hooks/use-passage-sessions'
import { useDeletePassage, usePassages } from '~/hooks/use-passages'

import { PassageRow } from './_components/passage-row'

export default function PassagesPage() {
  const t = useTranslations('Passages')
  const locale = useLocale()
  const { user } = useUser()
  const userId = user?.id ?? ''

  const { data: passages = [], isLoading: passagesLoading } = usePassages()
  const { data: latestExams = [] } = useLatestExamsByUser(userId)
  const deletePassage = useDeletePassage()

  const examByPassageId = Object.fromEntries(
    latestExams.map((s) => [s.passage_id, s]),
  )

  const isLoading = passagesLoading

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
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-muted h-14 animate-pulse rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && passages.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="text-foreground">{t('empty')}</p>
          <p className="text-muted-foreground text-sm">{t('emptyHint')}</p>
          <Link href={`/${locale}/admin/passages/new`}>
            <Button variant="outline" className="mt-2 gap-2">
              <Plus size={16} />
              {t('new')}
            </Button>
          </Link>
        </div>
      )}

      {!isLoading && passages.length > 0 && (
        <div className="border-border overflow-hidden rounded-xl border">
          <table className="w-full">
            <thead>
              <tr className="border-border bg-muted/40 text-muted-foreground border-b text-xs">
                <th className="py-2.5 pr-3 pl-4 text-left font-medium">
                  {t('tableColTitle')}
                </th>
                <th className="px-3 py-2.5 text-left font-medium">
                  {t('tableColScore')}
                </th>
                <th className="px-3 py-2.5 text-left font-medium">
                  {t('tableColLastExam')}
                </th>
                <th className="py-2.5 pr-4 pl-3 text-right font-medium">
                  {t('tableColAction')}
                </th>
              </tr>
            </thead>
            <tbody>
              {passages.map((p) => (
                <PassageRow
                  key={p.id}
                  passage={p}
                  lastExam={examByPassageId[p.id]}
                  onDelete={(id) => deletePassage.mutate(id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
