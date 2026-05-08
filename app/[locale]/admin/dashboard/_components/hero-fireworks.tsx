'use client'

import { motion } from 'framer-motion'

const FIREWORK_COLORS = [
  '#fbbf24',
  '#f472b6',
  '#a78bfa',
  '#34d399',
  '#60a5fa',
  '#fb7185',
  '#facc15',
] as const

const BURST_CENTERS = [
  { x: 18, y: 22, delay: 0 },
  { x: 78, y: 28, delay: 0.6 },
  { x: 42, y: 70, delay: 1.2 },
  { x: 88, y: 78, delay: 1.8 },
] as const

const PARTICLES_PER_BURST = 10
const PARTICLE_DISTANCE = 110

export function HeroFireworks() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {BURST_CENTERS.map((burst, burstIdx) => (
        <div
          key={burstIdx}
          className="absolute"
          style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
        >
          {Array.from({ length: PARTICLES_PER_BURST }).map((_, particleIdx) => {
            const angle = (particleIdx / PARTICLES_PER_BURST) * Math.PI * 2
            const dx = Math.cos(angle) * PARTICLE_DISTANCE
            const dy = Math.sin(angle) * PARTICLE_DISTANCE
            const color =
              FIREWORK_COLORS[
                (burstIdx * PARTICLES_PER_BURST + particleIdx) %
                  FIREWORK_COLORS.length
              ]
            return (
              <motion.span
                key={particleIdx}
                className="absolute h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 8px ${color}`,
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                animate={{
                  x: [0, dx],
                  y: [0, dy],
                  opacity: [0, 1, 0],
                  scale: [0.4, 1, 0.6],
                }}
                transition={{
                  duration: 1.4,
                  delay: burst.delay,
                  repeat: Infinity,
                  repeatDelay: 3.4,
                  ease: 'easeOut',
                }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
