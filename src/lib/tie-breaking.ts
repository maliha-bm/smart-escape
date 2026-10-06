/**
 * Deterministic tie-breaking rules (critical judging requirement).
 *
 * All string comparisons use plain UTF-16 code-unit ordering (`<` / `>`), NOT `localeCompare`,
 * so results never depend on the user's browser locale. This is standard lexicographic order:
 * "E10" < "E2" because '1' < '2'.
 */

/** Lexicographic comparison of two IDs. Returns negative, zero, or positive. */
export function compareIds(a: string, b: string): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/**
 * Lexicographic comparison of two node-ID sequences, element by element.
 * If one sequence is a strict prefix of the other, the shorter one is smaller.
 */
export function comparePaths(a: readonly string[], b: readonly string[]): number {
  const length = Math.min(a.length, b.length)
  for (let i = 0; i < length; i++) {
    const diff = compareIds(a[i], b[i])
    if (diff !== 0) return diff
  }
  return a.length - b.length
}

export interface PathCandidate {
  cost: number
  path: readonly string[]
}

/**
 * Orders two candidate paths to the SAME node:
 *   1. lower total cost wins;
 *   2. on equal cost, the lexicographically smaller node-ID sequence wins.
 */
export function comparePathCandidates(a: PathCandidate, b: PathCandidate): number {
  if (a.cost !== b.cost) return a.cost - b.cost
  return comparePaths(a.path, b.path)
}

export interface ExitCandidate extends PathCandidate {
  exitId: string
}

/**
 * Orders candidate destinations (each already the best path to its exit):
 *   1. lower total cost wins;
 *   2. on equal cost, the lexicographically smaller exit ID wins;
 *   3. on equal exit (cannot happen after Dijkstra, kept for total ordering), smaller node sequence wins.
 */
export function compareExitCandidates(a: ExitCandidate, b: ExitCandidate): number {
  if (a.cost !== b.cost) return a.cost - b.cost
  const byExit = compareIds(a.exitId, b.exitId)
  if (byExit !== 0) return byExit
  return comparePaths(a.path, b.path)
}
