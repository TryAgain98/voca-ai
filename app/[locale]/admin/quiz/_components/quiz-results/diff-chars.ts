export type DiffOpType = 'match' | 'extra' | 'missing'

export interface DiffOp {
  type: DiffOpType
  char: string
}

export function diffChars(expected: string, actual: string): DiffOp[] {
  const exp = expected.toLowerCase()
  const act = actual.toLowerCase()
  const m = exp.length
  const n = act.length
  const dp = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  )
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        exp[i - 1] === act[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }

  const ops: DiffOp[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && exp[i - 1] === act[j - 1]) {
      ops.push({ type: 'match', char: actual[j - 1] })
      i--
      j--
      continue
    }
    const subCost = i > 0 && j > 0 ? dp[i - 1][j - 1] : Infinity
    const delCost = i > 0 ? dp[i - 1][j] : Infinity
    const insCost = j > 0 ? dp[i][j - 1] : Infinity
    const min = Math.min(subCost, delCost, insCost)
    if (min === subCost) {
      ops.push({ type: 'extra', char: actual[j - 1] })
      ops.push({ type: 'missing', char: expected[i - 1] })
      i--
      j--
    } else if (min === delCost) {
      ops.push({ type: 'missing', char: expected[i - 1] })
      i--
    } else {
      ops.push({ type: 'extra', char: actual[j - 1] })
      j--
    }
  }
  return ops.reverse()
}
