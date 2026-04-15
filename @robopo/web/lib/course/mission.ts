import type { MissionState, MissionValue } from "@/lib/course/types"

// Display panel count or degrees
export function getMissionParameterUnit(mission: MissionValue): string {
  if (mission === "mf" || mission === "mb") {
    return "パネル"
  }
  if (mission === "tr" || mission === "tl") {
    return "度"
  }
  if (mission === "ps") {
    return ""
  }
  return "-"
}

// Convert MissionState to String
export function serializeMission(missionState: MissionState): string {
  return missionState
    .map((mission) => (mission === null ? "null" : mission))
    .join(";")
}

// Convert String to MissionState
export function deserializeMission(str: string): MissionState {
  return str
    .split(";")
    .map((mission) => (mission === "null" ? null : (mission as MissionValue)))
}

// Get mission pairs excluding Start and Goal directions from String
export function missionStatePair(missionState: MissionState): MissionValue[][] {
  // Return empty array if no mission pairs exist
  if (missionState.length <= 2) {
    return []
  }

  const pairs = []
  for (let i = 2; i < missionState.length; i += 2) {
    pairs.push([missionState[i], missionState[i + 1] ?? null])
  }
  return pairs
}

// Get next position and direction from current row, col, direction, and mission pair
export function getNextPosition(
  row: number,
  col: number,
  direction: MissionValue,
  mission0: MissionValue,
  mission1: MissionValue,
): [number, number, MissionValue] {
  // Determine next position and direction based on mission0 and mission1
  const mission1Num = Number(mission1)
  if (Number.isNaN(mission1Num)) {
    return [row, col, direction]
  }

  // Get next direction from current direction, rotation direction, and angle (in 90-degree units)
  function getDirection(
    directionTo: MissionValue,
    rotate: MissionValue,
    angle: MissionValue,
  ): MissionValue {
    if (typeof angle !== "number") {
      return direction
    }
    let temp: number
    switch (directionTo) {
      case "u":
        temp = 0
        break
      case "r":
        temp = 90
        break
      case "d":
        temp = 180
        break
      case "l":
        temp = 270
        break
      default:
        temp = 0
    }

    switch (rotate) {
      case "tr":
        temp += angle
        break
      case "tl":
        temp -= angle
        break
      default:
        break
    }

    temp = temp % 360
    if (temp < 0) {
      temp += 360
    }
    switch (temp) {
      case 0:
        return "u"
      case 90:
        return "r"
      case 180:
        return "d"
      case 270:
        return "l"
      default:
        return "u"
    }
  }

  switch (mission0) {
    case "mf":
      switch (direction) {
        case "u":
          return [row - mission1Num, col, "u"]
        case "r":
          return [row, col + mission1Num, "r"]
        case "d":
          return [row + mission1Num, col, "d"]
        case "l":
          return [row, col - mission1Num, "l"]
        default:
          return [row, col, direction]
      }
    case "mb":
      switch (direction) {
        case "u":
          return [row + mission1Num, col, "u"]
        case "r":
          return [row, col - mission1Num, "r"]
        case "d":
          return [row - mission1Num, col, "d"]
        case "l":
          return [row, col + mission1Num, "l"]
        default:
          return [row, col, direction]
      }
    case "tr":
      return [row, col, getDirection(direction, "tr", mission1Num)]
    case "tl":
      return [row, col, getDirection(direction, "tl", mission1Num)]
    case "ps":
      return [row, col, direction] // Pause: no position change
    default:
      return [row, col, direction]
  }
}

// Get robot position and direction from initial placement and current mission state
export function getRobotPosition(
  startRow: number,
  startCol: number,
  missionState: MissionState,
  nowMission: number,
): [number, number, MissionValue] {
  // Initial placement
  let row: number = startRow
  let col: number = startCol
  let direction: MissionValue = missionState[0]
  const missionPair = missionStatePair(missionState)
  for (let i = 0; i < nowMission; i++) {
    ;[row, col, direction] = getNextPosition(
      row,
      col,
      direction,
      missionPair[i][0],
      missionPair[i][1],
    )
  }
  return [row, col, direction]
}
