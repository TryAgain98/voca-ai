'use client'

import { cn } from '~/lib/cn'

import type { DiffToken } from '../../_utils/phoneme-diff'

export function PhonemeDisplay({ tokens }: { tokens: DiffToken[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-px font-mono text-3xl font-semibold tracking-wider">
      {tokens
        .filter((t) => t.status !== 'extra')
        .map((token, i) => (
          <span
            key={i}
            className={cn(
              token.status === 'match' && 'text-green-400',
              token.status === 'wrong' &&
                'text-red-400 underline decoration-red-400 decoration-wavy',
              token.status === 'missing' &&
                'text-amber-400 line-through opacity-50',
            )}
          >
            {token.char}
          </span>
        ))}
    </div>
  )
}
