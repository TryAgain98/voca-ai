'use client'

import { PlusCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '~/components/ui/select'
import { useLessons } from '~/hooks/use-lessons'

interface LessonSelectorProps {
  lessonId: string
  isNewLesson: boolean
  newLessonName: string
  onLessonChange: (id: string) => void
  onToggleNewLesson: (v: boolean) => void
  onNewLessonNameChange: (name: string) => void
  showLabel?: boolean
}

export function LessonSelector({
  lessonId,
  isNewLesson,
  newLessonName,
  onLessonChange,
  onToggleNewLesson,
  onNewLessonNameChange,
  showLabel = true,
}: LessonSelectorProps) {
  const t = useTranslations('Import')
  const tCommon = useTranslations('Common')
  const { data: lessons = [] } = useLessons()

  return (
    <div className="flex flex-col gap-2">
      {showLabel && <Label>{t('lessonLabel')}</Label>}
      {!isNewLesson ? (
        <div className="flex gap-2">
          <Select
            value={lessonId}
            onValueChange={(v) => v && onLessonChange(v)}
          >
            <SelectTrigger className="flex-1">
              <span
                className={`flex flex-1 truncate text-left text-sm${!lessonId ? 'text-muted-foreground' : ''}`}
              >
                {lessonId
                  ? (lessons.find((l) => l.id === lessonId)?.name ??
                    t('lessonPlaceholder'))
                  : t('lessonPlaceholder')}
              </span>
            </SelectTrigger>
            <SelectContent>
              {lessons.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onToggleNewLesson(true)}
          >
            <PlusCircle size={16} />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder={t('newLessonPlaceholder')}
            value={newLessonName}
            onChange={(e) => onNewLessonNameChange(e.target.value)}
            autoFocus
          />
          <Button variant="outline" onClick={() => onToggleNewLesson(false)}>
            {tCommon('cancel')}
          </Button>
        </div>
      )}
    </div>
  )
}
