import type { QuizAnswerDiffOp } from '~/types'

export function diffQuizAnswer(
  expected: string,
  actual: string,
): QuizAnswerDiffOp[] {
  const exp = expected.toLowerCase()
  const act = actual.toLowerCase()
  const m = exp.length
  const n = act.length

  // Anchor on the longest common subsequence, then align characters inside
  // each gap left-to-right. A substitution stays one wrong slot instead of
  // becoming a separate missing + extra pair.
  const dp = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        exp[i - 1] === act[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }

  const matches: { expectedIndex: number; actualIndex: number }[] = []
  let i = m
  let j = n

  while (i > 0 && j > 0) {
    if (exp[i - 1] === act[j - 1]) {
      matches.push({ expectedIndex: i - 1, actualIndex: j - 1 })
      i--
      j--
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }

  matches.reverse()

  const ops: QuizAnswerDiffOp[] = []
  let expectedPos = 0
  let actualPos = 0

  function addGap(endExpected: number, endActual: number) {
    while (expectedPos < endExpected && actualPos < endActual) {
      ops.push({
        type: 'wrong',
        char: actual[actualPos],
        expected_char: expected[expectedPos],
      })
      expectedPos++
      actualPos++
    }

    while (expectedPos < endExpected) {
      ops.push({ type: 'missing', char: expected[expectedPos] })
      expectedPos++
    }

    while (actualPos < endActual) {
      ops.push({ type: 'extra', char: actual[actualPos] })
      actualPos++
    }
  }

  for (const match of matches) {
    addGap(match.expectedIndex, match.actualIndex)
    ops.push({ type: 'match', char: expected[match.expectedIndex] })
    expectedPos = match.expectedIndex + 1
    actualPos = match.actualIndex + 1
  }

  addGap(m, n)

  return ops
}
