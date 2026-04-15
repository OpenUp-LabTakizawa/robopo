import { useMemo } from "react"
import { findIsolatedPanels, isGoal, isStart } from "@/lib/course/field"
import { missionStatePair } from "@/lib/course/mission"
import type {
  FieldState,
  MissionErrorReason,
  MissionState,
} from "@/lib/course/types"
import { validateMissions } from "@/lib/course/validation"

type ValidationResult = {
  hasStart: boolean
  hasGoal: boolean
  isolatedPanels: Set<string>
  invalidMissionMap: Map<number, MissionErrorReason>
  canSave: boolean
  saveBlockMessage: string | null
}

export function useCourseValidation({
  field,
  mission,
  name,
  nameError,
}: {
  field: FieldState
  mission: MissionState
  name: string
  nameError: string
}): ValidationResult {
  return useMemo(() => {
    const hasStartPanel = isStart(field)
    const hasGoalPanel = isGoal(field)

    // Isolated panels check
    const isolated = findIsolatedPanels(field)

    // Mission validation
    const invalidMissions =
      hasStartPanel && hasGoalPanel
        ? validateMissions(field, mission)
        : new Map<number, MissionErrorReason>()

    // Check mission configuration
    const pairs = missionStatePair(mission)
    const hasMissions = pairs.length > 0
    const allMissionsConfigured =
      hasMissions && pairs.every(([mType]) => mType !== null)

    // Mission direction set
    const hasStartDirection = mission[0] !== null

    // All conditions for save
    const nameValid = name.trim() !== "" && nameError === ""
    const fieldValid = hasStartPanel && hasGoalPanel && isolated.size === 0
    const missionValid =
      hasStartDirection && allMissionsConfigured && invalidMissions.size === 0

    const canSave = nameValid && fieldValid && missionValid

    const saveBlockMessage: string | null =
      !hasStartPanel && !hasGoalPanel
        ? "スタートとゴールパネルを配置してください"
        : !hasStartPanel
          ? "スタートパネルを配置してください"
          : !hasGoalPanel
            ? "ゴールパネルを配置してください"
            : name.trim() === ""
              ? "コース名を入力してください"
              : nameError
                ? nameError
                : isolated.size > 0
                  ? "接続されていないパネルがあります"
                  : !hasStartDirection
                    ? "スタートの向きを選択してください"
                    : !hasMissions
                      ? "ミッションを追加してください"
                      : !allMissionsConfigured
                        ? "未設定のミッションがあります"
                        : invalidMissions.size > 0
                          ? "無効なミッションがあります"
                          : null

    return {
      hasStart: hasStartPanel,
      hasGoal: hasGoalPanel,
      isolatedPanels: isolated,
      invalidMissionMap: invalidMissions,
      canSave,
      saveBlockMessage,
    }
  }, [field, mission, name, nameError])
}
