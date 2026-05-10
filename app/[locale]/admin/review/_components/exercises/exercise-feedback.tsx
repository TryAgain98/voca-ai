'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { Button } from '~/components/ui/button'

interface ExerciseFeedbackProps {
  show: boolean
  isCorrect: boolean
  onContinue: () => void
  correctAnswer?: string
  synonyms?: string[]
}

export function ExerciseFeedback({
  show,
  isCorrect,
  onContinue,
  correctAnswer,
  synonyms,
}: ExerciseFeedbackProps) {
  const t = useTranslations('Review')
  const showContinue = show && !isCorrect

  useEffect(() => {
    if (!showContinue) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') onContinue()
    }
    // Delay to avoid catching the same Enter keydown that triggered submission
    const timer = setTimeout(() => {
      window.addEventListener('keydown', handleKeyDown)
    }, 300)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showContinue, onContinue])

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
      {showContinue && (
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
          {synonyms && synonyms.length > 0 && (
            <p className="text-sm">
              <span className="text-muted-foreground">
                {t('alsoAccepted')}:{' '}
              </span>
              <span className="text-muted-foreground font-medium">
                {synonyms.join(', ')}
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
