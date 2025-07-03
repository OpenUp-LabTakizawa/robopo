import type React from "react"
import { Field } from "@/app/components/course/field"
import {
  type FieldState,
  getPanelHeight,
  getPanelWidth,
  IPPON_BASHI_SIZE,
  type MissionValue,
} from "@/app/components/course/utils"

// THE一本橋を表すコンポーネント
export function IpponBashiUI({
  botPosition,
  botDirection,
  nextMissionPair,
  onPanelClick,
}: {
  botPosition: { row: number; col: number }
  botDirection: MissionValue
  nextMissionPair: MissionValue[]
  onPanelClick: (row: number, col: number) => void
}): React.JSX.Element {
  const type: "ipponBashi" = "ipponBashi"
  // 一本橋の大きさ 幅1パネル 長さ5パネル 1パネル毎の大きさ60×60
  const width: number = 1
  const length: number = IPPON_BASHI_SIZE

  const field: FieldState = []
  for (let i = 0; i < length - 1; i++) {
    field.push(["route"])
  }
  field.push(["start"])

  const ipponBashiStyle: React.CSSProperties = {
    position: "relative",
    width: `${width * getPanelWidth(type)}px`,
    height: `${length * getPanelHeight(type)}px`,
    transform: "rotate(30deg)",
  }

  return (
    <Field
      field={field}
      type={type}
      botPosition={botPosition}
      botDirection={botDirection}
      nextMissionPair={nextMissionPair}
      onPanelClick={onPanelClick}
      customStyle={ipponBashiStyle}
    />
  )
}
