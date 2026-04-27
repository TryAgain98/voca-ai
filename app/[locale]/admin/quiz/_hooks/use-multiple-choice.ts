import { useCallback, useEffect, useRef, useState } from 'react'

import type {
  MCQuestion,
  MCResult,
  QuizVocab,
} from '~/app/[locale]/admin/quiz/_types/quiz.types'

const QUESTION_COUNT = 10
const ADVANCE_DELAY_MS = 900

function buildQuestions(vocab: QuizVocab[]): MCQuestion[] {
  const shuffled = [...vocab].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, QUESTION_COUNT)

  return selected.map((v) => {
    const distractors = vocab
      .filter((x) => x.id !== v.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((x) => x.meaning)

    const options = [...distractors, v.meaning].sort(() => Math.random() - 0.5)
    return { vocab: v, options, correctIndex: options.indexOf(v.meaning) }
  })
}

interface UseMCReturn {
  question: MCQuestion | null
  currentIndex: number
  total: number
  selected: number | null
  results: MCResult[]
  isFinished: boolean
  select: (index: number) => void
}

export function useMultipleChoice(
  vocab: QuizVocab[],
  onFinish: (results: MCResult[]) => void,
): UseMCReturn {
  const [questions] = useState<MCQuestion[]>(() => buildQuestions(vocab))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [results, setResults] = useState<MCResult[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isFinished = results.length === questions.length && questions.length > 0

  useEffect(() => {
    if (isFinished) onFinish(results)
    // onFinish is stable (wrapped in useCallback at call site); results intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished, onFinish])

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  const select = useCallback(
    (index: number) => {
      if (selected !== null) return
      const question = questions[currentIndex]
      if (!question) return

      setSelected(index)
      setResults((prev) => [
        ...prev,
        {
          question,
          selectedIndex: index,
          isCorrect: index === question.correctIndex,
        },
      ])

      timerRef.current = setTimeout(() => {
        setSelected(null)
        setCurrentIndex((i) => i + 1)
      }, ADVANCE_DELAY_MS)
    },
    [selected, questions, currentIndex],
  )

  return {
    question: questions[currentIndex] ?? null,
    currentIndex,
    total: questions.length,
    selected,
    results,
    isFinished,
    select,
  }
}
