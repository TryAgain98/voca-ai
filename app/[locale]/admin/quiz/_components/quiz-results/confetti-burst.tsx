'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

const COLORS = [
  'bg-amber-400',
  'bg-orange-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-primary',
  'bg-pink-500',
  'bg-purple-500',
] as const

const SHAPES = ['square', 'circle', 'bar'] as const
const PARTICLE_COUNT = 60

interface Particle {
  id: number
  color: string
  shape: (typeof SHAPES)[number]
  leftPct: number
  size: number
  rotateFrom: number
  rotateTo: number
  delay: number
  duration: number
  drift: number
}

function buildParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    shape: SHAPES[i % SHAPES.length],
    leftPct: Math.random() * 100,
    size: 6 + Math.random() * 8,
    rotateFrom: Math.random() * 360,
    rotateTo: Math.random() * 720 - 360,
    delay: Math.random() * 0.4,
    duration: 1.6 + Math.random() * 1.8,
    drift: (Math.random() - 0.5) * 30,
  }))
}

interface ConfettiBurstProps {
  active: boolean
}

export function ConfettiBurst({ active }: ConfettiBurstProps) {
  const particles = useMemo(() => (active ? buildParticles() : []), [active])
  if (!active) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => {
        const shapeClass =
          p.shape === 'circle'
            ? 'rounded-full'
            : p.shape === 'bar'
              ? 'rounded-sm'
              : 'rounded-[2px]'
        const w = p.shape === 'bar' ? p.size * 0.4 : p.size
        const h = p.shape === 'bar' ? p.size * 1.6 : p.size
        return (
          <motion.div
            key={p.id}
            initial={{
              top: -20,
              left: `${p.leftPct}%`,
              rotate: p.rotateFrom,
              opacity: 1,
            }}
            animate={{
              top: '110vh',
              left: `calc(${p.leftPct}% + ${p.drift}vw)`,
              rotate: p.rotateTo,
              opacity: 0,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.55, 0.08, 0.68, 0.53],
            }}
            className={`absolute ${p.color} ${shapeClass}`}
            style={{ width: `${w}px`, height: `${h}px` }}
          />
        )
      })}
    </div>
  )
}
