// Constants for course-out detail values
export const COURSE_OUT_FIRST = "courseOut:first" as const
export const COURSE_OUT_RETRY = "courseOut:retry" as const
export type CourseOutDetail = typeof COURSE_OUT_FIRST | typeof COURSE_OUT_RETRY

export type CourseOutRuleType = "keep" | "zero" | "penalty"

export type ParsedCourseOutRule = {
  type: CourseOutRuleType
  penalty: number
}

// Parse the courseOutRule string
export function parseCourseOutRule(rule: string): ParsedCourseOutRule {
  if (rule.startsWith("penalty:")) {
    const val = Number.parseInt(rule.split(":")[1], 10)
    return { type: "penalty", penalty: Number.isNaN(val) ? 0 : val }
  }
  if (rule === "zero") {
    return { type: "zero", penalty: 0 }
  }
  // "keep" or unknown values default to "keep"
  return { type: "keep", penalty: 0 }
}

// Score calculation on course-out (shared logic)
export function applyCourseOutRule(
  earnedPoint: number,
  parsed: ParsedCourseOutRule,
): number {
  switch (parsed.type) {
    case "zero":
      return 0
    case "penalty":
      return Math.max(0, earnedPoint - parsed.penalty)
    default:
      return earnedPoint
  }
}
