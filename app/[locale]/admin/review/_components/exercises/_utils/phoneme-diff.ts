export type TokenStatus = 'match' | 'wrong' | 'missing' | 'extra'

export interface DiffToken {
  char: string
  status: TokenStatus
}

export interface SpeechDiff {
  tokens: DiffToken[]
  matchRatio: number
  expectedSyllables: number
  recognizedSyllables: number
  isExact: boolean
}

function buildEditTable(a: string, b: string): number[][] {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  )
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      )
    }
  }
  return dp
}

function traceback(dp: number[][], a: string, b: string): DiffToken[] {
  const tokens: DiffToken[] = []
  let i = a.length
  let j = b.length

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      tokens.unshift({ char: a[i - 1], status: 'match' })
      i--
      j--
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      tokens.unshift({ char: a[i - 1], status: 'wrong' })
      i--
      j--
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      tokens.unshift({ char: a[i - 1], status: 'missing' })
      i--
    } else {
      tokens.unshift({ char: b[j - 1], status: 'extra' })
      j--
    }
  }
  return tokens
}

function countSyllables(word: string): number {
  return (word.toLowerCase().match(/[aeiouy]+/g) ?? []).length || 1
}

export function buildSpeechDiff(expected: string, spoken: string): SpeechDiff {
  const exp = expected.toLowerCase().trim()
  const spk = spoken.toLowerCase().trim()
  const isExact = exp === spk

  const dp = buildEditTable(exp, spk)
  const tokens = traceback(dp, exp, spk)
  const matches = tokens.filter((t) => t.status === 'match').length

  return {
    tokens,
    matchRatio: matches / Math.max(exp.length, 1),
    expectedSyllables: countSyllables(exp),
    recognizedSyllables: countSyllables(spk),
    isExact,
  }
}
