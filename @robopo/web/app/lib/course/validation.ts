import { findGoal, findStart, isInBounds } from "@/app/lib/course/field"
import {
  getNextPosition,
  getRobotPosition,
  missionStatePair,
} from "@/app/lib/course/mission"
import type {
  FieldState,
  MissionErrorReason,
  MissionState,
} from "@/app/lib/course/types"

// Validate missions and return which mission indices are invalid with reasons
export function validateMissions(
  field: FieldState,
  mission: MissionState,
): Map<number, MissionErrorReason> {
  const invalidMap = new Map<number, MissionErrorReason>()
  const start = findStart(field)
  const goal = findGoal(field)
  if (!start || !goal || mission[0] === null) {
    return invalidMap
  }
  const pairs = missionStatePair(mission)
  if (pairs.length === 0) {
    return invalidMap
  }

  for (let i = 0; i < pairs.length; i++) {
    const [mType, mParam] = pairs[i]
    // Skip unconfigured mission rows
    if (mType === null) {
      continue
    }

    const [row, col, dir] = getRobotPosition(start[0], start[1], mission, i)

    // Check current position is on course
    if (!isInBounds(field, row, col) || field[row][col] === null) {
      invalidMap.set(i, "off-course")
      continue
    }

    // For move missions, check all intermediate panels
    if (mType === "mf" || mType === "mb") {
      const steps = typeof mParam === "number" ? mParam : Number(mParam)
      if (!Number.isNaN(steps) && steps > 0) {
        let valid = true
        for (let s = 1; s <= steps; s++) {
          const [stepRow, stepCol] = getNextPosition(row, col, dir, mType, s)
          if (
            !isInBounds(field, stepRow, stepCol) ||
            field[stepRow][stepCol] === null
          ) {
            valid = false
            break
          }
        }
        if (!valid) {
          invalidMap.set(i, "off-course")
        }
      }
    }
  }

  // Check that the final position after all missions is on goal
  // Only check when ALL mission pairs are configured (no null mission types remain)
  const allConfigured = pairs.every(([mType]) => mType !== null)
  let lastConfiguredIndex = -1
  if (allConfigured) {
    lastConfiguredIndex = pairs.length - 1
  }
  if (lastConfiguredIndex >= 0 && !invalidMap.has(lastConfiguredIndex)) {
    const [row, col, dir] = getRobotPosition(
      start[0],
      start[1],
      mission,
      lastConfiguredIndex,
    )
    const [mType, mParam] = pairs[lastConfiguredIndex]
    const [finalRow, finalCol] = getNextPosition(row, col, dir, mType, mParam)
    if (!isInBounds(field, finalRow, finalCol)) {
      invalidMap.set(lastConfiguredIndex, "off-course")
    } else if (
      field[finalRow][finalCol] !== "goal" &&
      field[finalRow][finalCol] !== "startGoal"
    ) {
      invalidMap.set(lastConfiguredIndex, "not-at-goal")
    }
  }

  return invalidMap
}

// Validate course and mission
export function checkValidity(
  field: FieldState,
  mission: MissionState,
): boolean {
  const pairs = missionStatePair(mission)
  if (pairs.length === 0) {
    return false
  }
  const allConfigured = pairs.every(([mType]) => mType !== null)
  if (!allConfigured) {
    return false
  }
  return validateMissions(field, mission).size === 0
}
