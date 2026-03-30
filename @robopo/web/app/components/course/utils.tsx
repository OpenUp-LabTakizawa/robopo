// Panel size (shared by all course types)
export const PANEL_SIZE: number = 85

// Max size for course creation
export const MAX_FIELD_WIDTH: number = 3
export const MAX_FIELD_HEIGHT: number = 3

// Ippon Bashi size
export const IPPON_BASHI_SIZE: number = 5

export const RESERVED_COURSE_IDS = {
  IPPON: -1,
  SENSOR: -2,
} as const

// Panel types
export type PanelValue = "start" | "goal" | "route" | "startGoal" | null
export const PanelString: { [key in Exclude<PanelValue, null>]: string } = {
  start: "スタート",
  goal: "ゴール",
  route: "",
  startGoal: "スタート\nゴール",
}
export type FieldState = PanelValue[][]

// Mission types: u:up r:right d:down l:left
// mf:move_forward mb:move_backward tr:turn_right tl:turn_left
export type MissionValue =
  | "u"
  | "r"
  | "d"
  | "l"
  | "mf"
  | "mb"
  | "tr"
  | "tl"
  | ""
  | number
  | null
export const MissionString: {
  [key in Exclude<MissionValue, null>]: string | null
} = {
  u: "上向き",
  r: "右向き",
  d: "下向き",
  l: "左向き",
  mf: "前進",
  mb: "後進",
  tr: "右回転",
  tl: "左回転",
  "": "空",
}

// Mission
// Direction at start, direction at goal, followed by route missions...
export type MissionState = MissionValue[]

// Point
// start時のポイント(ハンデ的な?機能), goal時のポイント, 以後missionクリア毎ポイント…
export type PointValue = number | null
export type PointState = PointValue[]

// Display panel count or degrees
export function panelOrDegree(mission: MissionValue): string {
  if (mission === "mf" || mission === "mb") {
    return "パネル"
  }
  if (mission === "tr" || mission === "tl") {
    return "度"
  }
  return "-"
}

// Initialize field layout.
export function initializeField(): FieldState {
  const field: FieldState = Array(MAX_FIELD_WIDTH)
    .fill(null)
    .map(() => Array(MAX_FIELD_HEIGHT).fill(null))
  return field
}

// Check if start exists on the field
export function isStart(field: FieldState): boolean {
  for (const row of field) {
    for (const panel of row) {
      if (panel === "start" || panel === "startGoal") {
        return true
      }
    }
  }
  return false
}

// Check if goal exists on the field
export function isGoal(field: FieldState): boolean {
  for (const row of field) {
    for (const panel of row) {
      if (panel === "goal" || panel === "startGoal") {
        return true
      }
    }
  }
  return false
}

// Get start position on the field
export function findStart(field: FieldState): [number, number] | null {
  // Adjust to be at least Ippon Bashi size
  const height =
    MAX_FIELD_HEIGHT >= IPPON_BASHI_SIZE ? MAX_FIELD_HEIGHT : IPPON_BASHI_SIZE
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < MAX_FIELD_WIDTH; j++) {
      if (field[i][j] === "start" || field[i][j] === "startGoal") {
        return [i, j]
      }
    }
  }
  return null
}

// Place a panel at the specified position
export function putPanel(
  field: FieldState,
  row: number,
  col: number,
  mode: PanelValue,
): FieldState | null {
  const newField = field.map((newRow) => [...newRow]) // Create a copy of the field
  if (field[row][col] !== null) {
    // Placing goal on start creates startGoal
    if (mode === "goal" && field[row][col] === "start") {
      newField[row][col] = "startGoal"
      return newField
    }
    newField[row][col] = null // Remove panel
    return newField
  }

  // For non-start panels, check if adjacent to an existing panel
  if (mode !== "start") {
    // If placing goal, cannot place if goal already exists
    if (mode === "goal" && isGoal(field)) {
      return null
    }
    let nextTo = false // Flag for whether panel is adjacent
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ] // Array representing 4 directions

    // Loop through each direction
    directions.forEach(([dx, dy]) => {
      const x = row + dx
      const y = col + dy
      if (
        x >= 0 &&
        x < MAX_FIELD_WIDTH &&
        y >= 0 &&
        y < MAX_FIELD_HEIGHT &&
        field[x][y] !== null
      ) {
        nextTo = true
        return
      }
    })
    if (!nextTo) {
      return null
    }
  } else if (isStart(field)) {
    return null
  }
  newField[row][col] = mode // Place panel
  return newField
}

// Convert FieldState to String
export function serializeField(fieldState: FieldState): string {
  return fieldState
    .map((row) =>
      row.map((panel) => (panel === null ? "null" : panel)).join(","),
    )
    .join(";")
}

// Convert String to FieldState
export function deserializeField(str: string): FieldState {
  return str
    .split(";")
    .map((row) =>
      row
        .split(",")
        .map((panel) => (panel === "null" ? null : (panel as PanelValue))),
    )
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
  // Return empty array if no missions are set (excluding Start and Goal directions)
  if (missionState[3] === null) {
    return []
  }

  const pairs = []
  for (let i = 2; i < missionState.length; i += 2) {
    // The last pair is probably [goal direction, null]
    pairs.push([missionState[i], missionState[i + 1]])
  }
  return pairs
}

// Convert PointState to String
export function serializePoint(pointState: PointState): string {
  return pointState.map((point) => (point === null ? "null" : point)).join(";")
}

// Convert String to PointState
export function deserializePoint(str: string | null): PointState {
  if (!str) {
    return []
  }
  return str
    .split(";")
    .map((point) =>
      point === "null" ? null : (point as unknown as PointValue),
    )
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

// Validate course and mission
export function checkValidity(
  field: FieldState,
  mission: MissionState,
): boolean {
  // Check if start and goal exist
  if (!isStart(field) || !isGoal(field)) {
    return false
  }
  // False if start direction is not set
  if (mission[0] === null) {
    return false
  }
  // Check if all missions are on the course
  const missionPair = missionStatePair(mission)
  // False if missionPair is empty
  if (missionPair.length === 0) {
    return false
  }
  const start = findStart(field)
  for (let i = 0; i < missionPair.length; i++) {
    const [row, col, dir] = getRobotPosition(
      start?.[0] || 0,
      start?.[1] || 0,
      mission,
      i,
    )
    // False if not on the course
    if (
      field[row][col] !== "start" &&
      field[row][col] !== "goal" &&
      field[row][col] !== "startGoal" &&
      field[row][col] !== "route"
    ) {
      return false
    }
    // False if not on goal at the last mission
    if (i === missionPair.length - 1) {
      const [lastRow, lastCol] = getNextPosition(
        row,
        col,
        dir,
        missionPair[i][0],
        missionPair[i][1],
      )
      if (
        field[lastRow][lastCol] !== "goal" &&
        field[lastRow][lastCol] !== "startGoal"
      ) {
        return false
      }
    }
  }
  // All checks passed
  return true
}
