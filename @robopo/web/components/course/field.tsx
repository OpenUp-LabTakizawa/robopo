import type React from "react"
import { NextArrow, NextPauseIndicator } from "@/components/course/nextArrow"
import { Panel } from "@/components/course/panel"
import { Robot } from "@/components/course/robot"
import { getFieldBounds } from "@/lib/course/field"
import {
  type FieldState,
  MAX_FIELD_HEIGHT,
  MAX_FIELD_WIDTH,
  type MissionValue,
  PANEL_SIZE,
} from "@/lib/course/types"

type FieldProps = {
  field: FieldState
  type: "edit" | "challenge"
  botPosition?: { row: number; col: number }
  botDirection?: MissionValue
  botAfterPosition?: { row: number; col: number }
  botAfterAngle?: number
  isPlaying?: boolean
  isPauseMission?: boolean
  nextMission?: MissionValue[]
  onPanelClick: (row: number, col: number) => void
  onPanelPointerDown?: (row: number, col: number) => void
  onPanelPointerEnter?: (row: number, col: number) => void
  isolatedPanels?: Set<string>
  customStyle?: React.CSSProperties
}

// Field component
export function Field({
  field,
  type,
  botPosition,
  botDirection,
  botAfterPosition,
  botAfterAngle,
  isPlaying = false,
  isPauseMission = false,
  nextMission,
  onPanelClick,
  onPanelPointerDown,
  onPanelPointerEnter,
  isolatedPanels,
  customStyle,
}: FieldProps): React.JSX.Element {
  // In challenge mode, render only the bounding box of non-null cells
  // In edit mode, render the full grid
  const bounds = type === "challenge" ? getFieldBounds(field) : null
  const renderMinR = bounds ? bounds.minR : 0
  const renderMaxR = bounds ? bounds.maxR : MAX_FIELD_HEIGHT - 1
  const renderMinC = bounds ? bounds.minC : 0
  const renderMaxC = bounds ? bounds.maxC : MAX_FIELD_WIDTH - 1
  const renderWidth = renderMaxC - renderMinC + 1
  const renderHeight = renderMaxR - renderMinR + 1

  // In edit mode, use responsive sizing that fits within viewport
  // (100vw - 80px padding) / 5 columns, capped at PANEL_SIZE
  const responsiveCellSize =
    type === "edit"
      ? `min(${PANEL_SIZE}px, (100vw - 80px) / ${renderWidth})`
      : `${PANEL_SIZE}px`

  const styles =
    customStyle ??
    ({
      gridTemplateColumns: `repeat(${renderWidth}, ${responsiveCellSize})`,
      gridTemplateRows: `repeat(${renderHeight}, ${responsiveCellSize})`,
      "--cell-size": responsiveCellSize,
    } as React.CSSProperties)

  // Build cells for the visible portion
  const cells: {
    key: string
    panel: FieldState[0][0]
    r: number
    c: number
  }[] = []
  for (let r = renderMinR; r <= renderMaxR; r++) {
    for (let c = renderMinC; c <= renderMaxC; c++) {
      cells.push({
        key: `${r}-${c}-${String(field[r]?.[c])}`,
        panel: field[r]?.[c] ?? null,
        r,
        c,
      })
    }
  }

  return (
    <div className="relative mx-auto grid w-fit" style={styles}>
      {cells.map((cell) => (
        <Panel
          key={cell.key}
          value={cell.panel}
          isEditMode={type === "edit"}
          isIsolated={isolatedPanels?.has(`${cell.r}-${cell.c}`) ?? false}
          panelNumber={
            type === "edit" ? cell.r * MAX_FIELD_WIDTH + cell.c + 1 : undefined
          }
          onClick={() => onPanelClick(cell.r, cell.c)}
          onPointerDown={
            onPanelPointerDown
              ? () => onPanelPointerDown(cell.r, cell.c)
              : undefined
          }
          onPointerEnter={
            onPanelPointerEnter
              ? () => onPanelPointerEnter(cell.r, cell.c)
              : undefined
          }
        />
      ))}
      {/* Show bot during challenge */}
      {type === "challenge" && botPosition && botDirection && (
        <>
          <Robot
            row={botPosition.row - renderMinR}
            col={botPosition.col - renderMinC}
            direction={botDirection}
          />
          <NextArrow
            row={botPosition.row - renderMinR}
            col={botPosition.col - renderMinC}
            direction={botDirection}
            nextMission={nextMission}
            duration={1.5}
          />
        </>
      )}
      {/* Show bot preview during edit */}
      {type === "edit" && botPosition && botDirection && (
        <>
          <Robot
            row={botPosition.row}
            col={botPosition.col}
            direction={botDirection}
            afterRow={isPauseMission ? undefined : botAfterPosition?.row}
            afterCol={isPauseMission ? undefined : botAfterPosition?.col}
            afterAngle={isPauseMission ? undefined : botAfterAngle}
            responsive
            opacity={isPlaying ? 1 : 0.6}
          />
          {isPauseMission && (
            <NextPauseIndicator
              row={botPosition.row}
              col={botPosition.col}
              responsive
            />
          )}
        </>
      )}
    </div>
  )
}
