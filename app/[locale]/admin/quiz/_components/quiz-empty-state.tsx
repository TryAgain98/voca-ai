'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

import { buttonVariants } from '~/components/ui/button'

export function QuizEmptyState() {
  const t = useTranslations('Quiz')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="border-border/60 bg-muted/20 flex flex-col items-center gap-4 rounded-xl border px-6 py-10 text-center"
    >
      <div className="bg-primary/10 text-primary rounded-full p-3">
        <Sparkles size={22} strokeWidth={2} />
      </div>
      <div className="space-y-1">
        <h3 className="text-foreground text-base font-[590] tracking-tight">
          {t('emptyTitle')}
        </h3>
        <p className="text-muted-foreground text-sm">{t('emptySubtitle')}</p>
      </div>
      <Link
        href="/admin/review"
        className={buttonVariants({ size: 'lg' }) + ' gap-2'}
      >
        {t('goToReview')}
        <ArrowRight size={16} />
      </Link>
    </motion.div>
  )
}
