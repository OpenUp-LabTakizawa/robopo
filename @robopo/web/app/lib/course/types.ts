// Panel size (shared by all course types)
export const PANEL_SIZE: number = 85

// Max size for course creation
export const MAX_FIELD_WIDTH: number = 5
export const MAX_FIELD_HEIGHT: number = 5

// Panel types
export type PanelValue = "start" | "goal" | "route" | "startGoal" | null
export const PanelString: { [key in Exclude<PanelValue, null>]: string } = {
  start: "スタート",
  goal: "ゴール",
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
// start時のポイント(ハンデ的な?機能), goal時のポイント, 以後missionクリア毎ポイント…
export type PointValue = number | null
export type PointTier = number[] // 段階別ポイント（例: [20, 10, 5, 3, 0, -5]）
export type PointEntry = PointValue | PointTier // 単一値 or 段階選択
export type PointState = PointEntry[]

// Mission error reasons
export type MissionErrorReason = "off-course" | "not-at-goal"
