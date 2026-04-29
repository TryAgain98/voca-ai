let sharedCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    sharedCtx ??= new AudioContext()
    return sharedCtx
  } catch {
    return null
  }
}

function note(
  ctx: AudioContext,
  freq: number,
  startAt: number,
  duration: number,
  volume = 0.28,
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, startAt)
  gain.gain.linearRampToValueAtTime(volume, startAt + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration)
  osc.start(startAt)
  osc.stop(startAt + duration)
}

// Ascending 3-note chime: C5 → E5 → G5
export function playCorrectSound() {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  note(ctx, 523, t, 0.35)
  note(ctx, 659, t + 0.1, 0.35)
  note(ctx, 784, t + 0.2, 0.5)
}

// Descending pitch-bend "bwong" — classic wrong-answer feel
export function playWrongSound() {
  const ctx = getCtx()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  const t = ctx.currentTime
  osc.frequency.setValueAtTime(320, t)
  osc.frequency.exponentialRampToValueAtTime(140, t + 0.35)
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(0.3, t + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
  osc.start(t)
  osc.stop(t + 0.35)
}
