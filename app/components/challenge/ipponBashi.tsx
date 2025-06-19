import type React from "react"
import { NextArrow } from "@/app/components/course/nextArrow"
import { Panel } from "@/app/components/course/panel"
import { Robot } from "@/app/components/course/robot"
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
  const type: string = "ipponBashi"
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
    <div
      className={`relative grid grid-cols-${width} grid-rows-${length} mx-auto`}
      style={ipponBashiStyle}
    >
      {field.map((row, rowIndex) =>
        row.map((panel, colIndex) => (
          <Panel
            key={`${rowIndex}-${colIndex}`}
            value={panel}
            type={type}
            onClick={() => onPanelClick(rowIndex, colIndex)}
          />
        )),
      )}
      <Robot
        row={botPosition.row}
        col={botPosition.col}
        direction={botDirection}
        type={type}
      />
      <NextArrow
        row={botPosition.row}
        col={botPosition.col}
        direction={botDirection}
        nextMissionPair={nextMissionPair}
        duration={1.5}
        type={type}
      />
    </div>
  )
}
