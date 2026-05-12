import { Star } from 'lucide-react'

import { MAX_MASTERY_LEVEL } from '~/lib/mastery-scheduler'

const DOT_COLORS = [
  'bg-orange-400',
  'bg-amber-400',
  'bg-emerald-400',
  'bg-blue-400',
]

interface LevelDotsProps {
  level: number
  size?: 'sm' | 'md'
}

export function LevelDots({ level, size = 'sm' }: LevelDotsProps) {
  const isMax = level >= MAX_MASTERY_LEVEL
  const dotClass = size === 'md' ? 'h-2.5 w-2.5' : 'h-1.5 w-1.5'
  const starSize = size === 'md' ? 14 : 11

  return (
    <div className="flex items-center gap-1">
      {DOT_COLORS.map((color, i) => (
        <span
          key={i}
          className={`rounded-full transition-colors ${dotClass} ${
            i < level ? color : 'bg-white/10'
          } ${i === 1 ? 'mr-1' : ''}`}
        />
      ))}
      <Star
        size={starSize}
        className={isMax ? 'fill-yellow-400 text-yellow-400' : 'text-white/15'}
      />
    </div>
  )
}
