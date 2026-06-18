'use client'

import { useCallback, useRef, useState } from 'react'

import type { WritingScoreResult } from '~/providers/ai/types'
import type { WritingExercise } from '~/types'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface UseWritingChatReturn {
  messages: ChatMessage[]
  input: string
  isStreaming: boolean
  setInput: (v: string) => void
  sendMessage: (text?: string) => Promise<void>
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

export function useWritingChat(
  exercise: WritingExercise,
  result: WritingScoreResult,
  userSentence: string,
): UseWritingChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const sendMessage = useCallback(
    async (text?: string): Promise<void> => {
      const content = (text ?? input).trim()
      if (!content || isStreaming) return

      const userMsg: ChatMessage = { role: 'user', content }
      const nextMessages = [...messages, userMsg]
      setMessages(nextMessages)
      setInput('')
      setIsStreaming(true)

      const assistantMsg: ChatMessage = { role: 'assistant', content: '' }
      setMessages((prev) => [...prev, assistantMsg])
      setTimeout(scrollToBottom, 50)

      try {
        const res = await fetch('/api/writing-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            context: {
              keywords: exercise.keywords,
              userSentence,
              grammarScore: result.grammar_score,
              grammarFeedback: result.grammar_feedback.en,
              grammarErrors: result.grammar_errors ?? [],
              relevanceScore: result.relevance_score,
              relevanceFeedback: result.relevance_feedback.en,
              improvedSentence: result.improved_sentence,
              idealSentence: result.ideal_sentence,
            },
            messages: nextMessages,
          }),
        })

        const reader = res.body?.getReader()
        if (!reader) return

        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          setMessages((prev) => {
            const last = prev[prev.length - 1]
            return [
              ...prev.slice(0, -1),
              { ...last, content: last.content + chunk },
            ]
          })
          setTimeout(scrollToBottom, 10)
        }
      } catch {
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          return [
            ...prev.slice(0, -1),
            { ...last, content: 'Có lỗi xảy ra, vui lòng thử lại.' },
          ]
        })
      } finally {
        setIsStreaming(false)
        setTimeout(scrollToBottom, 100)
      }
    },
    [
      input,
      isStreaming,
      messages,
      exercise.keywords,
      userSentence,
      result,
      scrollToBottom,
    ],
  )

  return { messages, input, isStreaming, setInput, sendMessage, messagesEndRef }
}
