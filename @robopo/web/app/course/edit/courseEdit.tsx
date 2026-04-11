import { useCallback, useRef, useState } from "react"
import { Field } from "@/app/components/course/field"
import { Toolbar } from "@/app/components/course/toolbar"
import {
  type FieldState,
  initializeField,
  isGoal,
  isStart,
  type MissionValue,
  type PanelValue,
  putPanel,
} from "@/app/components/course/utils"
import type { ToolType } from "@/app/course/edit/courseEditContext"

type CourseEditProps = {
  field: FieldState
  setField: React.Dispatch<React.SetStateAction<FieldState>>
  selectedTool: ToolType
  setSelectedTool: React.Dispatch<React.SetStateAction<ToolType>>
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  pushHistory: () => void
  botPosition?: { row: number; col: number }
  botDirection?: MissionValue
  botAfterPosition?: { row: number; col: number }
  botAfterAngle?: number
  onRouteAdded?: (row: number, col: number) => void
  isolatedPanels?: Set<string>
}

export default function CourseEdit({
  field,
  setField,
  selectedTool,
  setSelectedTool,
  undo,
  redo,
  canUndo,
  canRedo,
  pushHistory,
  botPosition,
  botDirection,
  botAfterPosition,
  botAfterAngle,
  onRouteAdded,
  isolatedPanels,
}: CourseEditProps) {
  const [isDragging, setIsDragging] = useState(false)
  const lastCellRef = useRef<{ r: number; c: number } | null>(null)
  const pointerHandledRef = useRef(false)

  // Apply tool to a cell
  const applyTool = useCallback(
    (row: number, col: number) => {
      if (selectedTool === "eraser") {
        if (field[row][col] !== null) {
          const newField = field.map((r) => [...r])
          newField[row][col] = null
          setField(newField)
        }
        return
      }
      const mode = selectedTool as PanelValue
      const wasEmpty = field[row][col] === null
      const newField = putPanel(field, row, col, mode)
      if (newField) {
        setField(newField)
        // Auto-switch to route after placing start
        if (mode === "start" && !isStart(field)) {
          setSelectedTool("route")
        }
        // Auto-switch to route after placing goal
        if (mode === "goal" && !isGoal(field)) {
          setSelectedTool("route")
        }
        // Auto-add empty mission when a route panel is newly placed
        if (mode === "route" && wasEmpty && onRouteAdded) {
          onRouteAdded(row, col)
        }
      }
    },
    [field, setField, selectedTool, setSelectedTool, onRouteAdded],
  )

  function handlePanelClick(row: number, col: number) {
    // Skip if already handled by pointerDown (prevents double-fire on touch)
    if (pointerHandledRef.current) {
      pointerHandledRef.current = false
      return
    }
    pushHistory()
    applyTool(row, col)
  }

  function handlePointerDown(row: number, col: number) {
    pointerHandledRef.current = true
    pushHistory()
    setIsDragging(true)
    lastCellRef.current = { r: row, c: col }
    applyTool(row, col)
  }

  function handlePointerEnter(row: number, col: number) {
    if (isDragging) {
      const last = lastCellRef.current
      if (last && (last.r !== row || last.c !== col)) {
        lastCellRef.current = { r: row, c: col }
        applyTool(row, col)
      }
    }
  }

  function handlePointerUp() {
    setIsDragging(false)
    lastCellRef.current = null
  }

  function allClear() {
    pushHistory()
    setField(initializeField())
  }

  return (
    <div className="container mx-auto">
      <div className="card w-full min-w-72 bg-base-100 shadow-xl">
        <div className="card-body">
          <Toolbar
            field={field}
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            onClearAll={allClear}
          />
          <div
            className="mt-3"
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ touchAction: "none" }}
          >
            <Field
              type="edit"
              field={field}
              botPosition={botPosition}
              botDirection={botDirection}
              botAfterPosition={botAfterPosition}
              botAfterAngle={botAfterAngle}
              onPanelClick={handlePanelClick}
              onPanelPointerDown={handlePointerDown}
              onPanelPointerEnter={handlePointerEnter}
              isolatedPanels={isolatedPanels}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
