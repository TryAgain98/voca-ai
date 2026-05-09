export type FillSlot =
  | { kind: 'space' }
  | { kind: 'revealed'; char: string }
  | { kind: 'matched'; char: string }
  | { kind: 'typed'; char: string }
  | { kind: 'blank' }

const REVEAL_RATIO = 0.4

function seedFromString(value: string): number {
  let seed = 0
  for (let i = 0; i < value.length; i++) {
    seed = (seed * 31 + value.charCodeAt(i)) >>> 0
  }
  return seed || 1
}

export function shuffledLetterPositions(word: string): number[] {
  const positions: number[] = []
  for (let i = 0; i < word.length; i++) {
    if (word[i] !== ' ') positions.push(i)
  }
  let seed = seedFromString(word)
  for (let i = positions.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) >>> 0
    const j = seed % (i + 1)
    ;[positions[i], positions[j]] = [positions[j], positions[i]]
  }
  return positions
}

export function getMaxManualHints(letterCount: number): number {
  return Math.max(0, Math.floor(letterCount * REVEAL_RATIO) - 1)
}

export function buildFillSlots(
  word: string,
  userInput: string,
  revealed: Set<number>,
): FillSlot[] {
  const userChars = userInput.toLowerCase().replace(/\s+/g, '').split('')
  let letterIdx = 0
  return word.split('').map((expectedChar, i) => {
    if (expectedChar === ' ') return { kind: 'space' }
    const expectedLower = expectedChar.toLowerCase()
    const userChar = userChars[letterIdx]
    letterIdx++

    if (revealed.has(i)) {
      if (userChar === expectedLower) {
        return { kind: 'matched', char: expectedLower }
      }
      return { kind: 'revealed', char: expectedLower }
    }

    if (userChar === undefined) return { kind: 'blank' }
    return { kind: 'typed', char: userChar }
  })
}
