'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { cn } from '~/lib/cn'

import type { StoryWord } from '~/types'

interface QuizQuestion {
  word: StoryWord
  options: string[]
  correctIndex: number
}

function buildQuestions(words: StoryWord[]): QuizQuestion[] {
  return words.map((w) => {
    const distractors = words
      .filter((other) => other.id !== w.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((d) => d.meaning)

    const options = [...distractors, w.meaning].sort(() => Math.random() - 0.5)
    return { word: w, options, correctIndex: options.indexOf(w.meaning) }
  })
}

interface StoryQuizProps {
  targetWords: StoryWord[]
  onComplete: () => void
  isLoading: boolean
}

export function StoryQuiz({
  targetWords,
  onComplete,
  isLoading,
}: StoryQuizProps) {
  const t = useTranslations('Story')
  const [questions] = useState<QuizQuestion[]>(() =>
    buildQuestions(targetWords),
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const question = questions[currentIndex]
  const isAnswered = selectedIndex !== null
  const isLast = currentIndex === questions.length - 1

  function handleSelect(idx: number) {
    if (isAnswered) return
    setSelectedIndex(idx)
    if (idx === question.correctIndex) setScore((s) => s + 1)
  }

  function handleNext() {
    if (isLast) {
      onComplete()
      return
    }
    setCurrentIndex((i) => i + 1)
    setSelectedIndex(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {t('quizProgress', {
            current: currentIndex + 1,
            total: questions.length,
          })}
        </span>
        <span className="font-[510] text-emerald-400">
          {t('quizScore', { score })}
        </span>
      </div>

      <div className="bg-card rounded-2xl border px-6 py-6 text-center">
        <p className="text-muted-foreground mb-2 text-xs font-[510] tracking-wider uppercase">
          {t('quizInstruction')}
        </p>
        <p className="text-foreground text-2xl font-[590] tracking-[-0.5px]">
          {question.word.word}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correctIndex
          const isSelected = i === selectedIndex
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={isAnswered}
              className={cn(
                'flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all',
                !isAnswered && 'hover:border-border/60 cursor-pointer',
                isAnswered &&
                  isCorrect &&
                  'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
                isAnswered &&
                  isSelected &&
                  !isCorrect &&
                  'border-red-500/50 bg-red-500/10 text-red-400',
                !isAnswered && 'bg-card text-foreground',
              )}
            >
              <span>{opt}</span>
              {isAnswered && isCorrect && <CheckCircle2 size={14} />}
              {isAnswered && isSelected && !isCorrect && <XCircle size={14} />}
            </button>
          )
        })}
      </div>

      {isAnswered && (
        <Button onClick={handleNext} disabled={isLoading} className="w-full">
          {isLast ? t('quizFinishBtn') : t('quizNextBtn')}
        </Button>
      )}
    </div>
  )
}
