let sharedCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    sharedCtx ??= new AudioContext()
    if (sharedCtx.state === 'suspended') void sharedCtx.resume()
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

export function playSubmitSound() {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  note(ctx, 440, t, 0.08, 0.16)
  note(ctx, 660, t + 0.055, 0.11, 0.12)
}

export function playNextQuestionSound() {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  note(ctx, 392, t, 0.11, 0.12)
  note(ctx, 523, t + 0.08, 0.16, 0.14)
}

export function playHintSound() {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  note(ctx, 740, t, 0.12, 0.11)
  note(ctx, 587, t + 0.08, 0.18, 0.1)
}

export function playMilestoneSound() {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  note(ctx, 523, t, 0.12, 0.12)
  note(ctx, 659, t + 0.08, 0.14, 0.12)
  note(ctx, 880, t + 0.16, 0.2, 0.14)
}

export function playCountdownTick(intensity: 'low' | 'medium' | 'high') {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  const freq = intensity === 'high' ? 960 : intensity === 'medium' ? 720 : 520
  const duration =
    intensity === 'high' ? 0.07 : intensity === 'medium' ? 0.06 : 0.045
  const volume =
    intensity === 'high' ? 0.18 : intensity === 'medium' ? 0.12 : 0.07
  note(ctx, freq, t, duration, volume)
}
