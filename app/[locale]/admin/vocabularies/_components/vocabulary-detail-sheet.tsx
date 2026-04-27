'use client'

import { BookOpen, CalendarClock, CalendarPlus, Hash } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet'
import { dayjs } from '~/lib/dayjs'

import type { Lesson, Vocabulary } from '~/types'

interface VocabularyDetailSheetProps {
  voca: Vocabulary | null
  lessons: Lesson[]
  onClose: () => void
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  const d = dayjs(iso)
  if (!d.isValid()) return '—'
  return `${d.format('DD/MM/YYYY HH:mm')} · ${d.fromNow()}`
}

interface MetaRowProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

function MetaRow({ icon, label, value }: MetaRowProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="bg-muted text-muted-foreground mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
          {label}
        </p>
        <div className="mt-0.5 text-sm">{value}</div>
      </div>
    </div>
  )
}

export function VocabularyDetailSheet({
  voca,
  lessons,
  onClose,
}: VocabularyDetailSheetProps) {
  const lessonName = voca
    ? (lessons.find((l) => l.id === voca.lesson_id)?.name ?? voca.lesson_id)
    : ''

  return (
    <Sheet open={!!voca} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-md">
        {voca && (
          <>
            {/* Colored header */}
            <div className="from-primary/10 to-primary/5 border-b bg-gradient-to-br px-6 pt-8 pb-5">
              <SheetHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <SheetTitle className="text-3xl font-bold tracking-tight">
                      {voca.word}
                    </SheetTitle>
                    {voca.phonetic && (
                      <p className="text-primary/70 mt-1 font-mono text-sm">
                        {voca.phonetic}
                      </p>
                    )}
                  </div>
                  {voca.word_type && (
                    <Badge className="bg-primary/15 text-primary hover:bg-primary/20 mt-1 shrink-0 border-0 font-medium">
                      {voca.word_type}
                    </Badge>
                  )}
                </div>
              </SheetHeader>
            </div>

            <div className="space-y-6 px-6 py-5">
              {/* Meaning */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950/30">
                <p className="text-xs font-semibold tracking-wider text-blue-500 uppercase dark:text-blue-400">
                  Nghĩa
                </p>
                <p className="mt-1 text-base font-semibold">{voca.meaning}</p>
              </div>

              {/* Example */}
              {voca.example && (
                <div className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 dark:border-violet-900 dark:bg-violet-950/30">
                  <p className="text-xs font-semibold tracking-wider text-violet-500 uppercase dark:text-violet-400">
                    Ví dụ
                  </p>
                  <p className="mt-1 text-sm leading-relaxed italic">
                    {voca.example}
                  </p>
                </div>
              )}

              {/* Description */}
              {voca.description && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
                  <p className="text-xs font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                    Mô tả / Ghi chú
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {voca.description}
                  </p>
                </div>
              )}

              <Separator />

              {/* Meta info */}
              <div className="space-y-4">
                <MetaRow
                  icon={<BookOpen size={14} />}
                  label="Bài học"
                  value={<span className="font-medium">{lessonName}</span>}
                />
                <MetaRow
                  icon={<CalendarPlus size={14} />}
                  label="Ngày tạo"
                  value={
                    <span className="text-muted-foreground">
                      {formatDate(voca.created_at)}
                    </span>
                  }
                />
                <MetaRow
                  icon={<CalendarClock size={14} />}
                  label="Cập nhật lần cuối"
                  value={
                    <span className="text-muted-foreground">
                      {formatDate(voca.updated_at)}
                    </span>
                  }
                />
                <MetaRow
                  icon={<Hash size={14} />}
                  label="ID"
                  value={
                    <code className="text-muted-foreground text-xs break-all">
                      {voca.id}
                    </code>
                  }
                />
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
