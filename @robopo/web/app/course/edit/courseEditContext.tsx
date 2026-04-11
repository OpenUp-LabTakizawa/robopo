"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import {
  type FieldState,
  initializeField,
  type MissionState,
  type PointState,
} from "@/app/components/course/utils"

// Form contents
export type CourseEditState = {
  name: string
  description: string
  field: FieldState
  mission: MissionState
  point: PointState
  setName: React.Dispatch<React.SetStateAction<string>>
  setDescription: React.Dispatch<React.SetStateAction<string>>
  setField: React.Dispatch<React.SetStateAction<FieldState>>
  setMission: React.Dispatch<React.SetStateAction<MissionState>>
  setPoint: React.Dispatch<React.SetStateAction<PointState>>
}

// Dummy initial values
const dummy: CourseEditState = {
  name: "",
  description: "",
  field: initializeField(),
  mission: [],
  point: [],
  setName: () => {},
  setDescription: () => {},
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
  const [description, setDescription] = useState<string>("")
  const [field, setField] = useState<FieldState>(initializeField())
  const [mission, setMission] = useState<MissionState>([])
  const [point, setPoint] = useState<PointState>([0, 10])

  return (
    <CourseEditContext.Provider
      value={{
        name,
        description,
        field,
        mission,
        point,
        setName,
        setDescription,
        setField,
        setMission,
        setPoint,
      }}
    >
      {children}
    </CourseEditContext.Provider>
  )
}
