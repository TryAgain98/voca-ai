'use client'

import { motion } from 'framer-motion'

import { cn } from '~/lib/cn'

import type { FillSlot } from './_utils/answer-fill'

interface FillPatternDisplayProps {
  slots: FillSlot[]
  className?: string
}

export function FillPatternDisplay({
  slots,
  className,
}: FillPatternDisplayProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-baseline gap-x-1 font-mono text-base',
        className,
      )}
    >
      {slots.map((slot, i) => {
        if (slot.kind === 'space') {
          return <span key={i} className="w-3" aria-hidden />
        }
        if (slot.kind === 'matched') {
          return (
            <motion.span
              key={i}
              initial={{ scale: 1.4, color: '#5eead4' }}
              animate={{ scale: 1, color: '#10b981' }}
              transition={{ type: 'spring', stiffness: 400, damping: 14 }}
              className="inline-block w-[0.9em] text-center font-semibold uppercase"
            >
              {slot.char}
            </motion.span>
          )
        }
        return (
          <span
            key={i}
            className={cn(
              'inline-block w-[0.9em] text-center uppercase',
              slot.kind === 'revealed' && 'text-amber-300',
              slot.kind === 'typed' && 'text-foreground',
              slot.kind === 'blank' && 'text-muted-foreground/40',
            )}
          >
            {slot.kind === 'blank' ? '_' : slot.char}
          </span>
        )
      })}
    </div>
  )
}
