'use client'

import { useUser } from '@clerk/nextjs'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { useLatestWritingAttemptsByUser } from '~/hooks/use-writing-attempts'
import {
  useDeleteWritingExercise,
  useWritingExercises,
} from '~/hooks/use-writing-exercises'

import { WritingDeleteDialog } from './_components/writing-delete-dialog'
import {
  WritingExerciseCard,
  WritingExerciseRow,
} from './_components/writing-exercise-row'

import type { WritingExercise } from '~/types'

export default function WritingPage() {
  const t = useTranslations('Writing')
  const locale = useLocale()
  const { user } = useUser()
  const userId = user?.id ?? ''

  const { data: exercises = [], isLoading } = useWritingExercises(userId)
  const { data: latestAttempts = [] } = useLatestWritingAttemptsByUser(userId)
  const deleteExercise = useDeleteWritingExercise()
  const [deletingExercise, setDeletingExercise] =
    useState<WritingExercise | null>(null)

  const attemptByExerciseId = Object.fromEntries(
    latestAttempts.map((a) => [a.exercise_id, a]),
  )

  async function handleDeleteConfirm(): Promise<void> {
    if (!deletingExercise) return
    try {
      await deleteExercise.mutateAsync({
        id: deletingExercise.id,
        imageUrl: deletingExercise.image_url,
      })
      setDeletingExercise(null)
    } catch {
      // The mutation hook shows the error toast.
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl leading-7 font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm leading-5">
            {t('description')}
          </p>
        </div>
        <Link href={`/${locale}/admin/writing/new`}>
          <Button className="w-full gap-2 sm:w-auto">
            <Plus size={16} />
            {t('new')}
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-muted h-16 animate-pulse rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && exercises.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="text-foreground">{t('empty')}</p>
          <p className="text-muted-foreground text-sm">{t('emptyHint')}</p>
          <Link href={`/${locale}/admin/writing/new`}>
            <Button variant="outline" className="mt-2 gap-2">
              <Plus size={16} />
              {t('new')}
            </Button>
          </Link>
        </div>
      )}

      {!isLoading && exercises.length > 0 && (
        <div className="border-border overflow-hidden rounded-xl border">
          <div className="divide-y md:hidden">
            {exercises.map((ex) => (
              <WritingExerciseCard
                key={ex.id}
                exercise={ex}
                lastAttempt={attemptByExerciseId[ex.id]}
                onDelete={() => setDeletingExercise(ex)}
              />
            ))}
          </div>

          <table className="hidden w-full md:table">
            <thead>
              <tr className="border-border bg-muted/40 text-muted-foreground border-b text-xs">
                <th className="w-10 py-2.5 pr-3 pl-4 text-center font-medium">
                  {t('colNo')}
                </th>
                <th className="w-14 py-2.5 pr-3 pl-4 font-medium">
                  {t('colImage')}
                </th>
                <th className="py-2.5 pr-3 pl-2 text-left font-medium">
                  {t('colTitle')}
                </th>
                <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">
                  {t('colCreatedAt')}
                </th>
                <th className="px-3 py-2.5 text-left font-medium">
                  {t('colStatus')}
                </th>
                <th className="px-3 py-2.5 text-left font-medium">
                  {t('colScore')}
                </th>
                <th className="py-2.5 pr-4 pl-3 text-right font-medium">
                  {t('colAction')}
                </th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((ex, index) => (
                <WritingExerciseRow
                  key={ex.id}
                  index={index + 1}
                  exercise={ex}
                  lastAttempt={attemptByExerciseId[ex.id]}
                  onDelete={() => setDeletingExercise(ex)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <WritingDeleteDialog
        exercise={deletingExercise}
        isPending={deleteExercise.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingExercise(null)}
      />
    </div>
  )
}
