import {
  type FieldState,
  MAX_FIELD_HEIGHT,
  MAX_FIELD_WIDTH,
  type PanelValue,
} from "@/app/lib/course/types"

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
        x < field.length &&
        y >= 0 &&
        y < (field[0]?.length ?? 0) &&
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

// Check if a position is within field bounds
export function isInBounds(
  field: FieldState,
  row: number,
  col: number,
): boolean {
  return (
    row >= 0 && row < field.length && col >= 0 && col < (field[0]?.length ?? 0)
  )
}

// Find panels not connected to start via BFS
export function findIsolatedPanels(field: FieldState): Set<string> {
  const start = findStart(field)
  const allPanels = new Set<string>()
  for (let r = 0; r < field.length; r++) {
    for (let c = 0; c < field[r].length; c++) {
      if (field[r][c] !== null) {
        allPanels.add(`${r}-${c}`)
      }
    }
  }
  if (allPanels.size === 0) {
    return allPanels
  }
  if (!start) {
    return allPanels
  }

  const visited = new Set<string>()
  const queue: [number, number][] = [start]
  visited.add(`${start[0]}-${start[1]}`)
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]
  while (queue.length > 0) {
    const item = queue.shift()
    if (!item) {
      break
    }
    const [r, c] = item
    for (const [dr, dc] of directions) {
      const nr = r + dr
      const nc = c + dc
      const key = `${nr}-${nc}`
      if (
        isInBounds(field, nr, nc) &&
        field[nr][nc] !== null &&
        !visited.has(key)
      ) {
        visited.add(key)
        queue.push([nr, nc])
      }
    }
  }

  const isolated = new Set<string>()
  for (const key of allPanels) {
    if (!visited.has(key)) {
      isolated.add(key)
    }
  }
  return isolated
}
