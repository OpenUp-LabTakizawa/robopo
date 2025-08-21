"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import {
  type FieldState,
  initializeField,
  type MissionState,
  type PointState,
} from "@/app/components/course/utils"

// フォームの中身
export type CourseEditState = {
  name: string
  field: FieldState
  mission: MissionState
  point: PointState
  setName: React.Dispatch<React.SetStateAction<string>>
  setField: React.Dispatch<React.SetStateAction<FieldState>>
  setMission: React.Dispatch<React.SetStateAction<MissionState>>
  setPoint: React.Dispatch<React.SetStateAction<PointState>>
}

// ダミーの初期値
const dummy: CourseEditState = {
  name: "",
  field: initializeField(),
  mission: [],
  point: [],
  setName: () => {},
  setField: () => {},
  setMission: () => {},
  setPoint: () => {},
}

const CourseEditContext = createContext<CourseEditState>(dummy)

export const useCourseEdit = () => useContext(CourseEditContext)

export function CourseEditProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [name, setName] = useState<string>("")
  const [field, setField] = useState<FieldState>(initializeField())
  const [mission, setMission] = useState<MissionState>([])
  const [point, setPoint] = useState<PointState>([])

  return (
    <CourseEditContext.Provider
      value={{
        name,
        field,
        mission,
        point,
        setName,
        setField,
        setMission,
        setPoint,
      }}
    >
      {children}
    </CourseEditContext.Provider>
  )
}
