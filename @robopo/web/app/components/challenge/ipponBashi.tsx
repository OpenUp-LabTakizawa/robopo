import type React from "react"
import { Field } from "@/app/components/course/field"
import {
  type FieldState,
  getPanelHeight,
  getPanelWidth,
  IPPON_BASHI_SIZE,
  type MissionValue,
} from "@/app/components/course/utils"

// Component representing THE Ippon Bashi
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
  // Ippon Bashi size: 1 panel wide, 5 panels long, 60x60 per panel
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
