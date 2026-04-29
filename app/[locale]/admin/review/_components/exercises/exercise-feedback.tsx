'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

import { Button } from '~/components/ui/button'

interface ExerciseFeedbackProps {
  show: boolean
  isCorrect: boolean
  onContinue: () => void
  correctAnswer?: string
}

export function ExerciseFeedback({
  show,
  isCorrect,
  onContinue,
  correctAnswer,
}: ExerciseFeedbackProps) {
  const t = useTranslations('Review')

  return (
    <AnimatePresence>
      {show && isCorrect && (
        <motion.p
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="text-center text-lg font-semibold text-green-400"
        >
          {t('correct')}
        </motion.p>
      )}
      {show && !isCorrect && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          {correctAnswer && (
            <p className="text-sm">
              <span className="text-muted-foreground">
                {t('correctAnswer')}:{' '}
              </span>
              <span className="font-semibold text-green-400">
                {correctAnswer}
              </span>
            </p>
          )}
          <Button onClick={onContinue} className="w-full">
            {t('continueBtn')}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
