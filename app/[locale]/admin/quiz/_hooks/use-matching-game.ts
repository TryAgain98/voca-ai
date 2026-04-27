import { useCallback, useEffect, useRef, useState } from 'react'

import type {
  MatchPair,
  QuizVocab,
} from '~/app/[locale]/admin/quiz/_types/quiz.types'

const PAIR_COUNT = 8
const GAME_DURATION_S = 60
const WRONG_FLASH_MS = 600

interface UseMatchingReturn {
  words: MatchPair[]
  meanings: MatchPair[]
  selectedWordId: string | null
  selectedMeaningId: string | null
  wrongPair: { wordId: string; meaningId: string } | null
  matchedCount: number
  total: number
  combo: number
  score: number
  timeLeft: number
  isFinished: boolean
  selectWord: (id: string) => void
  selectMeaning: (id: string) => void
}

function buildPairs(vocab: QuizVocab[]): MatchPair[] {
  return [...vocab]
    .sort(() => Math.random() - 0.5)
    .slice(0, PAIR_COUNT)
    .map((v) => ({
      id: v.id,
      word: v.word,
      meaning: v.meaning,
      isMatched: false,
    }))
}

export function useMatchingGame(
  vocab: QuizVocab[],
  onFinish: (score: number) => void,
): UseMatchingReturn {
  const [pairs] = useState<MatchPair[]>(() => buildPairs(vocab))
  const [words, setWords] = useState<MatchPair[]>(() =>
    [...pairs].sort(() => Math.random() - 0.5),
  )
  const [meanings, setMeanings] = useState<MatchPair[]>(() =>
    [...pairs].sort(() => Math.random() - 0.5),
  )
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null)
  const [selectedMeaningId, setSelectedMeaningId] = useState<string | null>(
    null,
  )
  const [wrongPair, setWrongPair] = useState<{
    wordId: string
    meaningId: string
  } | null>(null)
  const [combo, setCombo] = useState(0)
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_S)
  const isProcessing = useRef(false)

  const matchedCount = words.filter((w) => w.isMatched).length
  const total = pairs.length
  const isFinished = matchedCount === total || timeLeft === 0

  useEffect(() => {
    if (isFinished) {
      onFinish(scoreRef.current)
      return
    }
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [isFinished, onFinish])

  const markMatched = useCallback((id: string) => {
    setWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMatched: true } : w)),
    )
    setMeanings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isMatched: true } : m)),
    )
  }, [])

  const tryMatch = useCallback(
    (wordId: string, meaningId: string) => {
      if (isProcessing.current) return
      isProcessing.current = true

      if (wordId === meaningId) {
        const newCombo = combo + 1
        setCombo(newCombo)
        const newScore = scoreRef.current + 100 * Math.min(newCombo, 3)
        scoreRef.current = newScore
        setScore(newScore)
        markMatched(wordId)
        setSelectedWordId(null)
        setSelectedMeaningId(null)
        isProcessing.current = false
      } else {
        setWrongPair({ wordId, meaningId })
        setCombo(0)
        setTimeout(() => {
          setWrongPair(null)
          setSelectedWordId(null)
          setSelectedMeaningId(null)
          isProcessing.current = false
        }, WRONG_FLASH_MS)
      }
    },
    [combo, markMatched],
  )

  const selectWord = useCallback(
    (id: string) => {
      if (isProcessing.current) return
      setSelectedWordId(id)
      if (selectedMeaningId) tryMatch(id, selectedMeaningId)
    },
    [selectedMeaningId, tryMatch],
  )

  const selectMeaning = useCallback(
    (id: string) => {
      if (isProcessing.current) return
      setSelectedMeaningId(id)
      if (selectedWordId) tryMatch(selectedWordId, id)
    },
    [selectedWordId, tryMatch],
  )

  return {
    words,
    meanings,
    selectedWordId,
    selectedMeaningId,
    wrongPair,
    matchedCount,
    total,
    combo,
    score,
    timeLeft,
    isFinished,
    selectWord,
    selectMeaning,
  }
}
