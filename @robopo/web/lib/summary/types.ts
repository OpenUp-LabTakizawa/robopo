export type JudgeSummary = {
  judgeId: number
  judgeName: string
  scoredPlayerCount: number
  scoredPlayerNames: string[]
  firstScoringTime: string | null
  lastScoringTime: string | null
  totalScoringCount: number
  courseCount: number
  courseNames: string[]
  averageScore: number | null
  courseOutCount: number
}

export type CourseCompetitionSummary = {
  courseId: number
  courseName: string
  firstChallengeTime: string | null
  firstCompletionTime: string | null
  lastChallengeTime: string | null
  challengerCount: number
  completionCount: number
  completionRate: number | null
  totalChallengeCount: number
  averageScore: number | null
  maxScore: number | null
  courseOutCount: number
  retryCount: number
}

export type CourseSummary = {
  playerId: number | null
  playerName: string | null
  playerFurigana: string | null
  playerBibNumber: string | null
  firstAttemptTime: string | null
  firstMaxAttemptCount: number | null
  firstMaxAttemptTime: string | null
  elapsedToComplete: string | null
  elapsedToCompleteSeconds: number | null
  lastAttemptTime: string | null
  firstAttemptScore: number | null
  averageScore: number | null
  courseOutCount: number | null
  retryCount: number | null
  attemptCount: number | null
  maxResult: number | null
  totalPoint: number | null
  sumPoint: number | null
  pointRank: number | null
  challengeCount: number | null
  challengeRank: number | null
}
