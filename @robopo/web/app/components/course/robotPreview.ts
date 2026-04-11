import {
  type FieldState,
  findStart,
  getNextPosition,
  getRobotPosition,
  type MissionState,
  type MissionValue,
  missionStatePair,
} from "@/app/components/course/utils"

export type RobotPreview = {
  row: number
  col: number
  direction: MissionValue
  afterRow?: number
  afterCol?: number
  afterAngle?: number
}

function dirToDeg(dir: MissionValue): number {
  switch (dir) {
    case "u":
      return 0
    case "r":
      return 90
    case "d":
      return 180
    case "l":
      return -90
    default:
      return 0
  }
}

/**
 * Compute robot preview position and after-mission position for animation.
 * Returns the robot's position before executing the selected mission,
 * and optionally the position after execution for loop animation.
 */
export function computeRobotPreview(
  field: FieldState,
  mission: MissionState,
  selectedMissionIndex: number | null,
): RobotPreview | null {
  const start = findStart(field)
  if (!start || mission.length === 0) {
    return null
  }

  const [startRow, startCol] = start
  const pairs = missionStatePair(mission)

  if (selectedMissionIndex === -2) {
    const dir = mission[0] as MissionValue
    if (!dir) {
      return null
    }
    return { row: startRow, col: startCol, direction: dir }
  }

  if (selectedMissionIndex !== null && selectedMissionIndex >= 0) {
    if (selectedMissionIndex >= pairs.length) {
      return null
    }
    const [row, col, dir] = getRobotPosition(
      startRow,
      startCol,
      mission,
      selectedMissionIndex,
    )
    const pair = pairs[selectedMissionIndex]
    if (pair[0] !== null && pair[1] !== null) {
      const [afterRow, afterCol] = getNextPosition(
        row,
        col,
        dir,
        pair[0],
        pair[1],
      )
      const beforeDeg = dirToDeg(dir)
      let afterAngle = beforeDeg
      if (pair[0] === "tr") {
        afterAngle = beforeDeg + Number(pair[1])
      } else if (pair[0] === "tl") {
        afterAngle = beforeDeg - Number(pair[1])
      }
      return { row, col, direction: dir, afterRow, afterCol, afterAngle }
    }
    return { row, col, direction: dir }
  }

  if (selectedMissionIndex === -3) {
    if (pairs.length === 0) {
      return null
    }
    const [row, col, dir] = getRobotPosition(
      startRow,
      startCol,
      mission,
      pairs.length,
    )
    return { row, col, direction: dir }
  }

  return null
}
