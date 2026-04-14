"use client"

import type React from "react"
import { createContext, useContext, useRef, useState } from "react"
import { useNavigationGuard } from "@/app/hooks/useNavigationGuard"
import { useUndoRedo } from "@/app/hooks/useUndoRedo"
import { initializeField } from "@/app/lib/course/field"
import type {
  FieldState,
  MissionState,
  PanelValue,
  PointState,
} from "@/app/lib/course/types"

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
  markInitialized: () => void
  resetInitialized: () => void
  nameError: string
  setNameError: React.Dispatch<React.SetStateAction<string>>
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
  markInitialized: () => {},
  resetInitialized: () => {},
  nameError: "",
  setNameError: () => {},
}

const CourseEditContext = createContext<CourseEditState>(dummy)

export const useCourseEdit = () => useContext(CourseEditContext)

export function CourseEditProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { setDirty } = useNavigationGuard()
  const initializedRef = useRef(false)

  const markDirty = () => {
    if (initializedRef.current) {
      setDirty(true)
    }
  }

  const markInitialized = () => {
    initializedRef.current = true
  }

  const resetInitialized = () => {
    initializedRef.current = false
  }

  const [nameError, setNameError] = useState("")

  const [name, setNameRaw] = useState<string>("")
  const [description, setDescriptionRaw] = useState<string>("")
  const [field, setFieldRaw] = useState<FieldState>(initializeField())
  // Default: 1 empty mission for the start panel action
  const [mission, setMissionRaw] = useState<MissionState>([
    null,
    null,
    null,
    null,
  ])
  const [point, setPointRaw] = useState<PointState>([0, 10, 0])
  const [missionPanelHints, setMissionPanelHintsRaw] = useState<
    (number | null)[]
  >([null])
  const [courseOutRule, setCourseOutRuleRaw] = useState<string>("keep")
  const [selectedTool, setSelectedTool] = useState<ToolType>("start")

  const setName: React.Dispatch<React.SetStateAction<string>> = (v) => {
    setNameRaw(v)
    markDirty()
  }
  const setDescription: React.Dispatch<React.SetStateAction<string>> = (v) => {
    setDescriptionRaw(v)
    markDirty()
  }
  const setField: React.Dispatch<React.SetStateAction<FieldState>> = (v) => {
    setFieldRaw(v)
    markDirty()
  }
  const setMission: React.Dispatch<React.SetStateAction<MissionState>> = (
    v,
  ) => {
    setMissionRaw(v)
    markDirty()
  }
  const setPoint: React.Dispatch<React.SetStateAction<PointState>> = (v) => {
    setPointRaw(v)
    markDirty()
  }
  const setMissionPanelHints: React.Dispatch<
    React.SetStateAction<(number | null)[]>
  > = (v) => {
    setMissionPanelHintsRaw(v)
    markDirty()
  }
  const setCourseOutRule: React.Dispatch<React.SetStateAction<string>> = (
    v,
  ) => {
    setCourseOutRuleRaw(v)
    markDirty()
  }

  // Field undo/redo
  const {
    push: pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<FieldState>({
    getSnapshot: () => field.map((row) => [...row]),
    applySnapshot: (snap: FieldState) => {
      setFieldRaw(snap)
      markDirty()
    },
  })

  // Mission undo/redo (includes panelHints for sync - Comment 1 fix)
  const {
    push: pushMissionHistory,
    undo: undoMission,
    redo: redoMission,
    canUndo: canUndoMission,
    canRedo: canRedoMission,
  } = useUndoRedo<MissionSnapshot>({
    getSnapshot: () => ({
      mission: [...mission],
      point: [...point],
      panelHints: [...missionPanelHints],
    }),
    applySnapshot: (snap: MissionSnapshot) => {
      setMissionRaw(snap.mission)
      setPointRaw(snap.point)
      setMissionPanelHintsRaw(snap.panelHints)
      markDirty()
    },
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
        markInitialized,
        resetInitialized,
        nameError,
        setNameError,
      }}
    >
      {children}
    </CourseEditContext.Provider>
  )
}
