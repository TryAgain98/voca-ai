'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib/cn'

import type { StoryWord } from '~/types'

interface TypeQuestion {
  word: StoryWord
}

interface StoryTypeProps {
  targetWords: StoryWord[]
  onComplete: () => void
  isLoading: boolean
}

export function StoryType({
  targetWords,
  onComplete,
  isLoading,
}: StoryTypeProps) {
  const t = useTranslations('Story')
  const inputRef = useRef<HTMLInputElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)

  const questions: TypeQuestion[] = targetWords.map((w) => ({ word: w }))
  const question = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1

  function handleCheck() {
    const correct =
      inputValue.trim().toLowerCase() === question.word.word.toLowerCase()
    setIsCorrect(correct)
    setChecked(true)
    if (correct) setScore((s) => s + 1)
  }

  function handleNext() {
    if (isLast) {
      onComplete()
      return
    }
    setCurrentIndex((i) => i + 1)
    setInputValue('')
    setChecked(false)
    setIsCorrect(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      if (!checked) handleCheck()
      else handleNext()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {t('typeProgress', {
            current: currentIndex + 1,
            total: questions.length,
          })}
        </span>
        <span className="font-[510] text-emerald-400">
          {t('typeScore', { score })}
        </span>
      </div>

      <div className="bg-card rounded-2xl border px-6 py-6 text-center">
        <p className="text-muted-foreground mb-2 text-xs font-[510] tracking-wider uppercase">
          {t('typeInstruction')}
        </p>
        <p className="text-foreground text-xl font-[510]">
          {question.word.meaning}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={checked}
          placeholder={t('typePlaceholder')}
          autoFocus
          className={cn(
            'text-center text-base',
            checked && isCorrect && 'border-emerald-500/50 text-emerald-400',
            checked && !isCorrect && 'border-red-500/50 text-red-400',
          )}
        />

        {checked && !isCorrect && (
          <div className="flex items-center gap-2 text-sm">
            <XCircle size={14} className="shrink-0 text-red-400" />
            <span className="text-muted-foreground">
              {t('typeCorrectAnswer')}:{' '}
              <span className="text-foreground font-[590]">
                {question.word.word}
              </span>
            </span>
          </div>
        )}
        {checked && isCorrect && (
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 size={14} />
            {t('typeCorrect')}
          </div>
        )}
      </div>

      {!checked ? (
        <Button
          onClick={handleCheck}
          disabled={!inputValue.trim()}
          className="w-full"
        >
          {t('typeCheckBtn')}
        </Button>
      ) : (
        <Button onClick={handleNext} disabled={isLoading} className="w-full">
          {isLast ? t('typeFinishBtn') : t('typeNextBtn')}
        </Button>
      )}
    </div>
  )
}
