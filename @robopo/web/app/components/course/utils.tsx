// デフォルトのパネルサイズ (Tコース)
const PANEL_WIDTH: number = 85
const PANEL_HEIGHT: number = 85

// THE 一本橋のパネルサイズ
const BASHI_PANEL_WIDTH: number = 85
const BASHI_PANEL_HEIGHT: number = 85

// コース作成の最大サイズ
export const MAX_FIELD_WIDTH: number = 3
export const MAX_FIELD_HEIGHT: number = 3

// 一本橋のサイズ
export const IPPON_BASHI_SIZE: number = 5

export const RESERVED_COURSE_IDS = {
  IPPON: -1,
  SENSOR: -2,
} as const

// パネルの幅を返す関数
export function getPanelWidth(type?: string): number {
  if (type === "ipponBashi") {
    return BASHI_PANEL_WIDTH
  }
  return PANEL_WIDTH
}

// パネルの高さを返す関数
export function getPanelHeight(type?: string): number {
  if (type === "ipponBashi") {
    return BASHI_PANEL_HEIGHT
  }
  return PANEL_HEIGHT
}

// Panelの種類
export type PanelValue = "start" | "goal" | "route" | null
export const PanelString: { [key in Exclude<PanelValue, null>]: string } = {
  start: "スタート",
  goal: "ゴール",
  route: "",
}
export type FieldState = PanelValue[][]

// Missionの種類 u:up上向き r:right右向き d:down下向き l:left左向き
// mf:move_forward前進 mb:move_backward後退 tr:turn_right右転 tl:turn_left左転
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
// start時の向き, goal時の向き, 以後ルート上のmission…
export type MissionState = MissionValue[]

// Point
// start時のポイント(ハンデ的な?機能), goal時のポイント, 以後missionクリア毎ポイント…
export type PointValue = number | null
export type PointState = PointValue[]

// パネルか度かを表示する
export function panelOrDegree(mission: MissionValue): string {
  if (mission === "mf" || mission === "mb") {
    return "パネル"
  }
  if (mission === "tr" || mission === "tl") {
    return "度"
  }
  return "-"
}

// 初期配置を表示する関数。
export function initializeField(): FieldState {
  const field: FieldState = Array(MAX_FIELD_WIDTH)
    .fill(null)
    .map(() => Array(MAX_FIELD_HEIGHT).fill(null))
  return field
}

// field上にstartがあるかをチェックする関数
export function isStart(field: FieldState): boolean {
  for (const row of field) {
    for (const panel of row) {
      if (panel === "start") {
        return true
      }
    }
  }
  return false
}

// field上にgoalがあるかをチェックする関数
export function isGoal(field: FieldState): boolean {
  for (const row of field) {
    for (const panel of row) {
      if (panel === "goal") {
        return true
      }
    }
  }
  return false
}

// field上のstartの位置を返す関数
export function findStart(field: FieldState): [number, number] | null {
  // 一本橋のサイズ以上になるように調整
  const height =
    MAX_FIELD_HEIGHT >= IPPON_BASHI_SIZE ? MAX_FIELD_HEIGHT : IPPON_BASHI_SIZE
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < MAX_FIELD_WIDTH; j++) {
      if (field[i][j] === "start") {
        return [i, j]
      }
    }
  }
  return null
}

// 指定された位置にpanelを置く処理を行う関数
export function putPanel(
  field: FieldState,
  row: number,
  col: number,
  mode: PanelValue,
): FieldState | null {
  const newField = field.map((newRow) => [...newRow]) // フィールドのコピーを作成
  if (field[row][col] !== null) {
    newField[row][col] = null // panelを消す
    return newField
  }

  // start以外の場合、panelに隣接しているかどうかを確認
  if (mode !== "start") {
    // goalの場合、goalが既に配置されている場合は置けない
    if (mode === "goal" && isGoal(field)) {
      return null
    }
    let nextTo = false // panelが隣接しているかどうかのフラグ
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ] // 4方向を表す配列

    // 各方向に対してループを行う
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
  newField[row][col] = mode // panelを置く
  return newField
}

// FieldState型をString型に変換する関数
export function serializeField(fieldState: FieldState): string {
  return fieldState
    .map((row) =>
      row.map((panel) => (panel === null ? "null" : panel)).join(","),
    )
    .join(";")
}

// String型をFieldState型に変換する関数
export function deserializeField(str: string): FieldState {
  return str
    .split(";")
    .map((row) =>
      row
        .split(",")
        .map((panel) => (panel === "null" ? null : (panel as PanelValue))),
    )
}

// missionStateをString型に変換する関数
export function serializeMission(missionState: MissionState): string {
  return missionState
    .map((mission) => (mission === null ? "null" : mission))
    .join(";")
}

// String型をMissionState型に変換する関数
export function deserializeMission(str: string): MissionState {
  return str
    .split(";")
    .map((mission) => (mission === "null" ? null : (mission as MissionValue)))
}

// String型からStartとGoal時の向き以外その他のミッションの配列を取得する関数
export function missionStatePair(missionState: MissionState): MissionValue[][] {
  // missionStateに最初のミッション(StartとGoalの向きを除く)が設定されていない場合、空配列を返す
  if (missionState[3] === null) {
    return []
  }

  const pairs = []
  for (let i = 2; i < missionState.length; i += 2) {
    // 多分、最後のpairは[ゴールの向き, null]になる
    pairs.push([missionState[i], missionState[i + 1]])
  }
  return pairs
}

// PointStateをString型に変換する関数
export function serializePoint(pointState: PointState): string {
  return pointState.map((point) => (point === null ? "null" : point)).join(";")
}

// String型をPointState型に変換する関数
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

// 現在のrowとcolとdirectionとmissionPairから次のpositionとdirectionを取得する関数
export function getNextPosition(
  row: number,
  col: number,
  direction: MissionValue,
  mission0: MissionValue,
  mission1: MissionValue,
): [number, number, MissionValue] {
  // mission0, mission1の向きによって次のpositionとdirectionを決定する
  const mission1Num = Number(mission1)
  if (Number.isNaN(mission1Num)) {
    return [row, col, direction]
  }

  // directionと回転方向、回転角度(90度単位)から次のdirectionを取得する関数
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

// 初期配置と現在のmissionStateからRobotのpositionとdirectionを取得する関数
export function getRobotPosition(
  startRow: number,
  startCol: number,
  missionState: MissionState,
  nowMission: number,
): [number, number, MissionValue] {
  // 初期配置
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

// courseとmissionの有効性を確認する関数
export function checkValidity(
  field: FieldState,
  mission: MissionState,
): boolean {
  // startとgoalの存在を確認
  if (!isStart(field) || !isGoal(field)) {
    return false
  }
  // スタート向きが無ければはfalse
  if (mission[0] === null) {
    return false
  }
  // 全てのmissionにおいてコース上か確認する
  const missionPair = missionStatePair(mission)
  // missionPairに何も入っていなければはfalse
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
    // コース上に存在しない場合はfalse
    if (
      field[row][col] !== "start" &&
      field[row][col] !== "goal" &&
      field[row][col] !== "route"
    ) {
      return false
    }
    // 最後のmissionでgoal上に存在しない場合はfalse
    if (i === missionPair.length - 1) {
      const [lastRow, lastCol] = getNextPosition(
        row,
        col,
        dir,
        missionPair[i][0],
        missionPair[i][1],
      )
      if (field[lastRow][lastCol] !== "goal") {
        return false
      }
    }
  }
  // 全checkが通ったらtrue
  return true
}
