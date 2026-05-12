// Returns a boolean array aligned to `actual`:
// true = this char was part of the LCS with `expected` (correctly typed)
// false = this char is extra / wrong
export function markActualChars(expected: string, actual: string): boolean[] {
  const exp = expected.toLowerCase()
  const act = actual.toLowerCase()
  const m = exp.length
  const n = act.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        exp[i - 1] === act[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }

  const matched = new Array(n).fill(false)
  let i = m
  let j = n

  while (i > 0 && j > 0) {
    if (exp[i - 1] === act[j - 1]) {
      matched[j - 1] = true
      i--
      j--
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }

  return matched
}
