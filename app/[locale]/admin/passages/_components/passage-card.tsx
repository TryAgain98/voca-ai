'use client'

import { Clock, FileText, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'

import type { Passage } from '~/types'

interface PassageCardProps {
  passage: Passage
  onDelete: (id: string) => void
}

function formatSeconds(s: number | null): string {
  if (!s) return '—'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}m ${sec}s` : `${s}s`
}

export function PassageCard({ passage, onDelete }: PassageCardProps) {
  const t = useTranslations('Passages')
  const locale = useLocale()
  const wordCount = passage.content.trim().split(/\s+/).length

  return (
    <div
      className="group relative flex flex-col gap-3 rounded-xl border p-4 transition-colors hover:border-white/15"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg"
          style={{ background: 'rgba(94,106,210,0.15)' }}
        >
          <FileText size={16} className="text-[#7170ff]" />
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/${locale}/admin/passages/${passage.id}`}
            className="line-clamp-1 text-sm font-medium text-[#f7f8f8] transition-colors hover:text-[#7170ff]"
          >
            {passage.title}
          </Link>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-[#8a8f98] opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
          onClick={() => onDelete(passage.id)}
        >
          <Trash2 size={14} />
        </Button>
      </div>

      <div className="flex items-center gap-3 text-xs text-[#8a8f98]">
        <span>{t('wordsCount', { count: wordCount })}</span>
        {passage.time_good && (
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatSeconds(passage.time_good)}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Link
          href={`/${locale}/admin/passages/${passage.id}/practice`}
          className="flex-1"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs"
          >
            {t('practiceButton')}
          </Button>
        </Link>
        <Link
          href={`/${locale}/admin/passages/${passage.id}/exam`}
          className="flex-1"
        >
          <Button size="sm" className="w-full gap-1.5 text-xs">
            {t('examButton')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
