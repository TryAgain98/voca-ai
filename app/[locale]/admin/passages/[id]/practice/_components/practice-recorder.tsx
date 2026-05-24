'use client'

import { Mic, MicOff, RefreshCw, Save } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { scoreColor, scoreLevel } from '~/lib/passage-score'
import { cn } from '~/lib/utils'

import type { PracticeState } from '../_hooks/use-practice-session'

const MOTIVATION: Record<string, { title: string; hint: string }> = {
  good: { title: '🎉 Xuất sắc!', hint: 'Phát âm rất tốt, tiếp tục phát huy!' },
  ok: { title: '👍 Khá tốt!', hint: 'Một số từ cần luyện thêm — thử lại nhé.' },
  poor: { title: '💪 Cố lên!', hint: 'Hãy nghe lại từng đoạn và luyện thêm.' },
}

interface PracticeRecorderProps {
  state: PracticeState
  score: number
  isSupported: boolean
  onStart: () => void
  onReset: () => void
  onSave: () => void
}

export function PracticeRecorder({
  state,
  score,
  isSupported,
  onStart,
  onReset,
  onSave,
}: PracticeRecorderProps) {
  const level = scoreLevel(score)
  const motivation = MOTIVATION[level]!

  return (
    <div
      className="flex flex-col gap-4 rounded-xl border p-5"
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      {state === 'scored' && (
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <span className={cn('text-4xl font-bold', scoreColor(score))}>
              {score}
            </span>
            <span className="text-xs text-[#8a8f98]">/ 100</span>
          </div>
          <div>
            <p className="text-sm font-medium text-[#f7f8f8]">
              {motivation.title}
            </p>
            <p className="mt-0.5 text-xs text-[#8a8f98]">{motivation.hint}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        {state === 'idle' && (
          <Button
            onClick={onStart}
            disabled={!isSupported}
            className="flex-1 gap-2 bg-[#5e6ad2] text-white hover:bg-[#828fff]"
          >
            <Mic size={16} />
            {isSupported ? 'Bắt đầu đọc' : 'Trình duyệt không hỗ trợ'}
          </Button>
        )}

        {state === 'listening' && (
          <Button
            variant="outline"
            className="flex-1 gap-2 border-red-400/40 text-red-400"
            disabled
          >
            <MicOff size={16} className="animate-pulse" />
            Đang nghe...
          </Button>
        )}

        {state === 'scored' && (
          <>
            <Button variant="outline" onClick={onReset} className="gap-2">
              <RefreshCw size={16} />
              Thử lại
            </Button>
            <Button onClick={onSave} className="flex-1 gap-2">
              <Save size={16} />
              Lưu kết quả
            </Button>
          </>
        )}
      </div>

      {!isSupported && (
        <p className="text-xs text-[#8a8f98]">
          Dùng Chrome hoặc Edge để sử dụng tính năng nhận diện giọng nói.
        </p>
      )}
    </div>
  )
}
