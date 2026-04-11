// Panel size (shared by all course types)
export const PANEL_SIZE: number = 85

// Max size for course creation
export const MAX_FIELD_WIDTH: number = 5
export const MAX_FIELD_HEIGHT: number = 5

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
  | "ps"
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
  ps: "一時停止",
  "": "空",
}

// Mission
// Direction at start, direction at goal, followed by route missions...
export type MissionState = MissionValue[]

// Point
// start時のポイント(ハンデ的な?機能), goal時のポイント, 以後missionクリア毎ポイント…
export type PointValue = number | null
export type PointTier = number[] // 段階別ポイント（例: [20, 10, 5, 3, 0, -5]）
export type PointEntry = PointValue | PointTier // 単一値 or 段階選択
export type PointState = PointEntry[]

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

// Initialize field layout.
export function initializeField(): FieldState {
  const field: FieldState = Array(MAX_FIELD_HEIGHT)
    .fill(null)
    .map(() => Array(MAX_FIELD_WIDTH).fill(null))
  return field
}

// Get bounding box of non-null cells in the field
export function getFieldBounds(field: FieldState): {
  minR: number
  maxR: number
  minC: number
  maxC: number
} {
  let minR = field.length
  let maxR = 0
  let minC = field[0]?.length ?? 0
  let maxC = 0
  for (let r = 0; r < field.length; r++) {
    for (let c = 0; c < field[r].length; c++) {
      if (field[r][c] !== null) {
        minR = Math.min(minR, r)
        maxR = Math.max(maxR, r)
        minC = Math.min(minC, c)
        maxC = Math.max(maxC, c)
      }
    }
  }
  if (minR > maxR) {
    return { minR: 0, maxR: 0, minC: 0, maxC: 0 }
  }
  return { minR, maxR, minC, maxC }
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
  for (let i = 0; i < field.length; i++) {
    for (let j = 0; j < field[i].length; j++) {
      if (field[i][j] === "start" || field[i][j] === "startGoal") {
        return [i, j]
      }
    }
  }
  return null
}

// Get goal position on the field
export function findGoal(field: FieldState): [number, number] | null {
  for (let i = 0; i < field.length; i++) {
    for (let j = 0; j < field[i].length; j++) {
      if (field[i][j] === "goal" || field[i][j] === "startGoal") {
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

// Convert String to FieldState (with backward-compatible padding to MAX size)
export function deserializeField(str: string): FieldState {
  const raw = str
    .split(";")
    .map((row) =>
      row
        .split(",")
        .map((panel) => (panel === "null" ? null : (panel as PanelValue))),
    )
  // Pad to MAX_FIELD_HEIGHT x MAX_FIELD_WIDTH if smaller
  const field = initializeField()
  for (let r = 0; r < raw.length && r < MAX_FIELD_HEIGHT; r++) {
    for (let c = 0; c < raw[r].length && c < MAX_FIELD_WIDTH; c++) {
      field[r][c] = raw[r][c]
    }
  }
  return field
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

// Convert PointState to String
// Single values: number, Tier values: (n1,n2,n3,...)
export function serializePoint(pointState: PointState): string {
  return pointState
    .map((entry) => {
      if (entry === null) {
        return "null"
      }
      if (Array.isArray(entry)) {
        return `(${entry.join(",")})`
      }
      return String(entry)
    })
    .join(";")
}

// Convert String to PointState
export function deserializePoint(str: string | null): PointState {
  if (!str) {
    return []
  }
  const result: PointState = []
  // Parse with support for (...) tier format
  let i = 0
  const parts: string[] = []
  let current = ""
  let inParens = false
  for (i = 0; i < str.length; i++) {
    const ch = str[i]
    if (ch === "(" && !inParens) {
      inParens = true
      current += ch
    } else if (ch === ")" && inParens) {
      inParens = false
      current += ch
    } else if (ch === ";" && !inParens) {
      parts.push(current)
      current = ""
    } else {
      current += ch
    }
  }
  if (current) {
    parts.push(current)
  }

  for (const part of parts) {
    if (part === "null") {
      result.push(null)
    } else if (part.startsWith("(") && part.endsWith(")")) {
      // Tier: (20,10,5,3,0,-5)
      const inner = part.slice(1, -1)
      result.push(inner.split(",").map(Number))
    } else {
      result.push(Number(part))
    }
  }
  return result
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
    // Bounds check
    if (
      row < 0 ||
      row >= field.length ||
      col < 0 ||
      col >= (field[0]?.length ?? 0)
    ) {
      return false
    }
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
      // Bounds check for final position
      if (
        lastRow < 0 ||
        lastRow >= field.length ||
        lastCol < 0 ||
        lastCol >= (field[0]?.length ?? 0)
      ) {
        return false
      }
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
