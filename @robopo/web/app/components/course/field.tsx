import type React from "react"
import { NextArrow } from "@/app/components/course/nextArrow"
import { Panel } from "@/app/components/course/panel"
import { Robot } from "@/app/components/course/robot"
import {
  type FieldState,
  getPanelHeight,
  getPanelWidth,
  MAX_FIELD_HEIGHT,
  MAX_FIELD_WIDTH,
  type MissionValue,
} from "@/app/components/course/utils"

type FieldProps = {
  field: FieldState
  type: "edit" | "challenge" | "ipponBashi"
  botPosition?: { row: number; col: number }
  botDirection?: MissionValue
  nextMissionPair?: MissionValue[]
  onPanelClick: (row: number, col: number) => void
  customStyle?: React.CSSProperties
}

// Fieldを表すコンポーネント
export function Field({
  field,
  type,
  botPosition,
  botDirection,
  nextMissionPair,
  onPanelClick,
  customStyle,
}: FieldProps): React.JSX.Element {
  const styles = customStyle ?? {
    gridTemplateColumns: `repeat(${MAX_FIELD_WIDTH}, ${getPanelWidth()}px)`,
    gridTemplateRows: `repeat(${MAX_FIELD_HEIGHT}, ${getPanelHeight()}px)`,
  }
  return (
    <div className="relative mx-auto grid" style={styles}>
      {field.map((row, rowIndex) =>
        row.map((panel, colIndex) => (
          <Panel
            key={`panel-${rowIndex}-${colIndex}-${String(panel)}`}
            value={panel}
            onClick={() => onPanelClick(rowIndex, colIndex)}
          />
        )),
      )}
      {/* challengeの時はbotを表示 */}
      {(type === "challenge" || type === "ipponBashi") &&
        botPosition &&
        botDirection && (
          <>
            <Robot
              row={botPosition.row}
              col={botPosition.col}
              direction={botDirection}
            />
            <NextArrow
              row={botPosition.row}
              col={botPosition.col}
              direction={botDirection}
              nextMissionPair={nextMissionPair}
              duration={1.5}
            />
          </>
        )}
    </div>
  )
}
