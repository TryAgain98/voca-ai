'use client'

import { Bot, Loader2, MessageCircle, Send, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'

import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

import { useWritingChat } from '../_hooks/use-writing-chat'

import type { WritingScoreResult } from '~/providers/ai/types'
import type { WritingExercise } from '~/types'

interface WritingChatBotProps {
  exercise: WritingExercise
  result: WritingScoreResult
  userSentence: string
}

function getSuggestedPrompts(
  result: WritingScoreResult,
  locale: string,
): string[] {
  const isVi = locale === 'vi'
  const prompts: string[] = []

  if (result.grammar_score < 80) {
    prompts.push(
      isVi ? 'Giải thích lỗi ngữ pháp của tôi' : 'Explain my grammar errors',
    )
  }
  if (result.relevance_score < 80) {
    prompts.push(
      isVi
        ? 'Tại sao câu tôi chưa liên quan đến ảnh?'
        : 'Why is my sentence not relevant?',
    )
  }
  prompts.push(
    isVi
      ? 'Cho thêm ví dụ với các từ khóa này'
      : 'Give more examples with these keywords',
  )
  prompts.push(
    isVi ? 'Cách cải thiện câu của tôi?' : 'How can I improve my sentence?',
  )

  return prompts.slice(0, 4)
}

function AssistantMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p className="text-foreground mb-1.5 text-sm leading-relaxed last:mb-0">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-indigo-600 dark:text-indigo-300">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="text-muted-foreground not-italic">{children}</em>
        ),
        code: ({ children }) => (
          <code className="rounded bg-indigo-100 px-1.5 py-0.5 font-mono text-xs text-indigo-700 dark:bg-indigo-500/25 dark:text-indigo-200">
            {children}
          </code>
        ),
        ul: ({ children }) => (
          <ul className="my-1 ml-1 flex list-none flex-col gap-0.5">
            {children}
          </ul>
        ),
        li: ({ children }) => (
          <li className="flex gap-2 text-sm">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-indigo-500/60" />
            <span className="text-foreground">{children}</span>
          </li>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export function WritingChatBot({
  exercise,
  result,
  userSentence,
}: WritingChatBotProps) {
  const t = useTranslations('WritingChat')
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const {
    messages,
    input,
    isStreaming,
    setInput,
    sendMessage,
    messagesEndRef,
  } = useWritingChat(exercise, result, userSentence)

  const suggestedPrompts = getSuggestedPrompts(result, locale)
  const showSuggestions = messages.length === 0

  async function handleSend(): Promise<void> {
    await sendMessage()
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'fixed right-6 bottom-6 z-50 flex size-12 items-center justify-center rounded-full shadow-lg transition-all',
          'bg-indigo-600 text-white hover:bg-indigo-500',
          isOpen && 'hidden',
        )}
        aria-label={t('open')}
      >
        <MessageCircle size={20} />
      </button>

      <div
        className={cn(
          'fixed right-4 bottom-4 z-50 flex h-[600px] w-80 flex-col transition-all duration-300 xl:w-96',
          'border-border bg-card rounded-2xl border shadow-2xl',
          isOpen
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-4 opacity-0',
        )}
      >
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-indigo-400" />
            <span className="text-foreground text-sm font-semibold">
              {t('title')}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-7"
            onClick={() => setIsOpen(false)}
          >
            <X size={14} />
          </Button>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {showSuggestions && (
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-xs">
                {t('suggestedLabel')}
              </p>
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => void sendMessage(prompt)}
                  className="border-border bg-muted/40 hover:bg-muted text-foreground rounded-lg border px-3 py-2 text-left text-xs transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex flex-col',
                msg.role === 'user' ? 'items-end' : 'items-start',
              )}
            >
              <div
                className={cn(
                  'max-w-[88%] rounded-2xl px-3 py-2.5',
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-sm leading-relaxed text-white'
                    : 'text-foreground border border-indigo-200 bg-indigo-50 dark:border-indigo-500/20 dark:bg-indigo-500/10',
                )}
              >
                {msg.role === 'assistant' ? (
                  msg.content ? (
                    <AssistantMessage content={msg.content} />
                  ) : (
                    <Loader2
                      size={14}
                      className="animate-spin text-indigo-400"
                    />
                  )
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-border flex items-end gap-2 border-t p-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder')}
            rows={1}
            disabled={isStreaming}
            className={cn(
              'flex-1 resize-none rounded-lg px-3 py-2 text-sm outline-none',
              'bg-muted text-foreground placeholder:text-muted-foreground',
              'max-h-24 disabled:opacity-50',
            )}
          />
          <Button
            size="icon"
            className="size-9 shrink-0 bg-indigo-600 hover:bg-indigo-500"
            onClick={() => void handleSend()}
            disabled={!input.trim() || isStreaming}
          >
            <Send size={14} />
          </Button>
        </div>
      </div>
    </>
  )
}
