import { findIsolatedPanels, isGoal, isStart } from "@/lib/course/field"
import { missionStatePair } from "@/lib/course/mission"
import type {
  FieldState,
  MissionErrorReason,
  MissionState,
} from "@/lib/course/types"
import { validateMissions } from "@/lib/course/validation"

export type ValidationResult = {
  hasStart: boolean
  hasGoal: boolean
  isolatedPanels: Set<string>
  invalidMissionMap: Map<number, MissionErrorReason>
  canSave: boolean
  saveBlockMessage: string | null
}

export type CourseValidationInput = {
  field: FieldState
  mission: MissionState
  name: string
  nameError: string
}

// The first failing check wins; this is the order the editor guides the
// user through (field → name → connectivity → missions).
type SaveCheck = { blocked: boolean; message: string }

function firstBlockingMessage(checks: readonly SaveCheck[]): string | null {
  return checks.find((c) => c.blocked)?.message ?? null
}

// Pure validation so it can be unit-tested without React. The hook below is
// a thin wrapper; the React Compiler memoizes the call for us.
export function validateCourse({
  field,
  mission,
  name,
  nameError,
}: CourseValidationInput): ValidationResult {
  const hasStart = isStart(field)
  const hasGoal = isGoal(field)
  const isolatedPanels = findIsolatedPanels(field)

  // Missions can only be validated against a field with both endpoints
  const invalidMissionMap =
    hasStart && hasGoal
      ? validateMissions(field, mission)
      : new Map<number, MissionErrorReason>()

  const pairs = missionStatePair(mission)
  const hasMissions = pairs.length > 0
  const allMissionsConfigured =
    hasMissions && pairs.every(([mType]) => mType !== null)
  const hasStartDirection = mission[0] !== null
  const nameBlank = name.trim() === ""

  const saveBlockMessage = firstBlockingMessage([
    {
      blocked: !hasStart && !hasGoal,
      message: "スタートとゴールパネルを配置してください",
    },
    { blocked: !hasStart, message: "スタートパネルを配置してください" },
    { blocked: !hasGoal, message: "ゴールパネルを配置してください" },
    { blocked: nameBlank, message: "コース名を入力してください" },
    { blocked: nameError !== "", message: nameError },
    {
      blocked: isolatedPanels.size > 0,
      message: "接続されていないパネルがあります",
    },
    {
      blocked: !hasStartDirection,
      message: "スタートの向きを選択してください",
    },
    { blocked: !hasMissions, message: "ミッションを追加してください" },
    {
      blocked: !allMissionsConfigured,
      message: "未設定のミッションがあります",
    },
    {
      blocked: invalidMissionMap.size > 0,
      message: "無効なミッションがあります",
    },
  ])

  return {
    hasStart,
    hasGoal,
    isolatedPanels,
    invalidMissionMap,
    canSave: saveBlockMessage === null,
    saveBlockMessage,
  }
}

export function useCourseValidation(
  input: CourseValidationInput,
): ValidationResult {
  return validateCourse(input)
}
