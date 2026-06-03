'use client'

import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { buttonVariants } from '~/components/ui/button'
import { STORY_COMPLETION_POINTS } from '~/lib/score-config'

export function StoryComplete() {
  const t = useTranslations('Story')
  const params = useParams()
  const locale = params.locale as string

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto flex max-w-md flex-col items-center gap-6 text-center"
    >
      <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl">
        <Trophy size={28} className="text-primary" />
      </div>

      <div>
        <h2 className="text-foreground text-2xl font-[590] tracking-[-0.5px]">
          {t('completeTitle')}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          {t('completeDesc')}
        </p>
        <p className="text-primary mt-3 text-sm font-[510]">
          {t('completePoints', { points: STORY_COMPLETION_POINTS })}
        </p>
      </div>

      <Link
        href={`/${locale}/admin/dashboard`}
        className={buttonVariants({ className: 'w-full' })}
      >
        {t('completeDashboardBtn')}
      </Link>
    </motion.div>
  )
}
