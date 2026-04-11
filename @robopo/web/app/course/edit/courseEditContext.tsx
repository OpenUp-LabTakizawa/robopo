"use client"

import type React from "react"
import { createContext, useCallback, useContext, useState } from "react"
import {
  type FieldState,
  initializeField,
  type MissionState,
  type PanelValue,
  type PointState,
} from "@/app/components/course/utils"
import { useUndoRedo } from "@/app/hooks/useUndoRedo"

export type ToolType = PanelValue | "eraser"

export type MissionSnapshot = {
  mission: MissionState
  point: PointState
  panelHints: (number | null)[]
}

// Form contents
export type CourseEditState = {
  name: string
  description: string
  field: FieldState
  mission: MissionState
  point: PointState
  missionPanelHints: (number | null)[]
  courseOutRule: string
  selectedTool: ToolType
  setName: React.Dispatch<React.SetStateAction<string>>
  setDescription: React.Dispatch<React.SetStateAction<string>>
  setField: React.Dispatch<React.SetStateAction<FieldState>>
  setMission: React.Dispatch<React.SetStateAction<MissionState>>
  setPoint: React.Dispatch<React.SetStateAction<PointState>>
  setMissionPanelHints: React.Dispatch<React.SetStateAction<(number | null)[]>>
  setCourseOutRule: React.Dispatch<React.SetStateAction<string>>
  setSelectedTool: React.Dispatch<React.SetStateAction<ToolType>>
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  pushHistory: () => void
  undoMission: () => void
  redoMission: () => void
  canUndoMission: boolean
  canRedoMission: boolean
  pushMissionHistory: () => void
}

// Dummy initial values
const dummy: CourseEditState = {
  name: "",
  description: "",
  field: initializeField(),
  mission: [],
  point: [],
  missionPanelHints: [null],
  courseOutRule: "keep",
  selectedTool: "start",
  setName: () => {},
  setDescription: () => {},
  setField: () => {},
  setMission: () => {},
  setPoint: () => {},
  setMissionPanelHints: () => {},
  setCourseOutRule: () => {},
  setSelectedTool: () => {},
  undo: () => {},
  redo: () => {},
  canUndo: false,
  canRedo: false,
  pushHistory: () => {},
  undoMission: () => {},
  redoMission: () => {},
  canUndoMission: false,
  canRedoMission: false,
  pushMissionHistory: () => {},
}

const CourseEditContext = createContext<CourseEditState>(dummy)

export const useCourseEdit = () => useContext(CourseEditContext)

export function CourseEditProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [name, setName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [field, setField] = useState<FieldState>(initializeField())
  // Default: 1 empty mission for the start panel action
  const [mission, setMission] = useState<MissionState>([null, null, null, null])
  const [point, setPoint] = useState<PointState>([0, 10, 0])
  const [missionPanelHints, setMissionPanelHints] = useState<(number | null)[]>(
    [null],
  )
  const [courseOutRule, setCourseOutRule] = useState<string>("keep")
  const [selectedTool, setSelectedTool] = useState<ToolType>("start")

  // Field undo/redo
  const {
    push: pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<FieldState>({
    getSnapshot: useCallback(() => field.map((row) => [...row]), [field]),
    applySnapshot: useCallback((snap: FieldState) => setField(snap), []),
  })

  // Mission undo/redo (includes panelHints for sync - Comment 1 fix)
  const {
    push: pushMissionHistory,
    undo: undoMission,
    redo: redoMission,
    canUndo: canUndoMission,
    canRedo: canRedoMission,
  } = useUndoRedo<MissionSnapshot>({
    getSnapshot: useCallback(
      () => ({
        mission: [...mission],
        point: [...point],
        panelHints: [...missionPanelHints],
      }),
      [mission, point, missionPanelHints],
    ),
    applySnapshot: useCallback((snap: MissionSnapshot) => {
      setMission(snap.mission)
      setPoint(snap.point)
      setMissionPanelHints(snap.panelHints)
    }, []),
  })

  return (
    <CourseEditContext.Provider
      value={{
        name,
        description,
        field,
        mission,
        point,
        missionPanelHints,
        courseOutRule,
        selectedTool,
        setName,
        setDescription,
        setField,
        setMission,
        setPoint,
        setMissionPanelHints,
        setCourseOutRule,
        setSelectedTool,
        undo,
        redo,
        canUndo,
        canRedo,
        pushHistory,
        undoMission,
        redoMission,
        canUndoMission,
        canRedoMission,
        pushMissionHistory,
      }}
    >
      {children}
    </CourseEditContext.Provider>
  )
}
