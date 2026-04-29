// Live spectator data structures shared between API, SSE, and client.

export type SpectatorTheme =
  | "esports"
  | "cyberpunk"
  | "hero"
  | "arcade"
  | "stadium"

export const SPECTATOR_THEMES: SpectatorTheme[] = [
  "esports",
  "cyberpunk",
  "hero",
  "arcade",
  "stadium",
]

export const SPECTATOR_THEME_LABELS: Record<SpectatorTheme, string> = {
  esports: "eスポーツ",
  cyberpunk: "サイバーパンク",
  hero: "ヒーロー(特撮)",
  arcade: "アーケード",
  stadium: "スタジアム",
}

export type SpectatorPlayerInfo = {
  id: number
  name: string
  furigana: string | null
  bibNumber: string | null
}

export type SpectatorCourseInfo = {
  id: number
  name: string
  description: string | null
  field: string | null
  mission: string | null
  point: string | null
  courseOutRule: string
  maxPoint: number
}

export type SpectatorBoardRow = {
  rank: number
  player: SpectatorPlayerInfo
  perCourse: Record<number, number | null>
  total: number
  attempts: number
}

export type SpectatorCourseBest = {
  courseId: number
  point: number
  player: SpectatorPlayerInfo | null
}

export type SpectatorLastRun = {
  challengeId: number
  player: SpectatorPlayerInfo
  course: SpectatorCourseInfo
  firstResult: number
  retryResult: number | null
  detail: string | null
  point: number
  bestPoint: number
  previousBestPoint: number
  attemptsBefore: number
  attemptsAfter: number
  isPersonalBest: boolean
  isCourseBest: boolean
  createdAt: string
}

// Per-course summary for one player.
export type SpectatorPlayerCourseSummary = {
  courseId: number
  bestPoint: number
  attempts: number
  // The reachedIndex of the player's best attempt on this course
  // (used to render the player-detail course preview).
  bestReachedIndex: number
  // Latest challenge stats on this course (regardless of best).
  lastReachedIndex: number | null
  lastChallengeAt: string | null
}

export type SpectatorPlayerDetail = {
  player: SpectatorPlayerInfo
  totalPoint: number
  totalAttempts: number
  rank: number | null
  perCourse: Record<number, SpectatorPlayerCourseSummary>
}

export type SpectatorSnapshot = {
  competition: {
    id: number
    name: string
    startDate: string | null
    endDate: string | null
  }
  masked: boolean
  courses: SpectatorCourseInfo[]
  board: SpectatorBoardRow[]
  bestPerCourse: Record<number, SpectatorCourseBest>
  /** Most recent *highlight* challenge (personal-best or course-best). null if none yet. */
  lastRun: SpectatorLastRun | null
  /** All competition players keyed by playerId, with per-course summaries. */
  playerDetails: Record<number, SpectatorPlayerDetail>
  generatedAt: string
}

// Server-Sent Events payloads
export type SpectatorEvent =
  | { kind: "snapshot"; snapshot: SpectatorSnapshot }
  | { kind: "ping"; at: string }
  | { kind: "challenge"; competitionId: number }
