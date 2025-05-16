"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import CourseEdit from "@/app/course/edit/courseEdit"
import MissionEdit from "@/app/course/edit/missionEdit"
import {
  initializeField,
  deserializeField,
  FieldState,
  deserializeMission,
  MissionState,
  PointState,
  deserializePoint,
} from "@/app/components/course/utils"
import { getCourse } from "@/app/components/course/listUtils"
import { finModal, saveModal, validationModal } from "@/app/components/course/modals"

export default function Edit() {
  const searchParams = useSearchParams()
  const [modalOpen, setModalOpen] = useState(0)
  const [field, setField] = useState<FieldState>(initializeField())
  const [mission, setMission] = useState<MissionState>([])
  const [point, setPoint] = useState<PointState>([])
  const [name, setName] = useState<string>("")

  useEffect(() => {
    async function fetchCourseData() {
      const id = Number(searchParams.get("id"))
      if (id) {
        const course = await getCourse(id)
        if (course) {
          if (course.field) setField(deserializeField(course.field))
          if (course.mission) setMission(deserializeMission(course.mission))
          if (course.point) setPoint(deserializePoint(course.point))
          if (course.name) setName(course.name)
        }
      }
    }
    fetchCourseData()
  }, [searchParams])

  const handleButtonClick = (id: number) => {
    setModalOpen(id)
  }

  return (
    <>
      <div className="h-full w-full">
        <div className="sm:max-h-screen sm:grid sm:grid-cols-2 gap-4">
          <div className="sm:w-full sm:justify-self-end">
            <CourseEdit field={field} setField={setField} />
          </div>
          <div className="sm:w-full sm:mx-4 sm:justify-self-start">
            <MissionEdit mission={mission} setMission={setMission} point={point} setPoint={setPoint} />
          </div>
        </div>
        <div className="flex p-4 mt-0 gap-4 justify-center">
          <button className="btn btn-primary min-w-28 max-w-fit" onClick={() => handleButtonClick(3)}>
            有効性チェック
          </button>
          <button className="btn btn-primary min-w-28 max-w-fit" onClick={() => handleButtonClick(2)}>
            コースを保存
          </button>
          <button className="btn btn-primary min-w-28 max-w-fit" onClick={() => handleButtonClick(1)}>
            一覧に戻る
          </button>
        </div>
      </div>

      {modalOpen === 1 && finModal({ setModalOpen })}
      {modalOpen === 2 && saveModal({ setModalOpen, name, setName, field, mission, point })}
      {modalOpen === 3 && validationModal({ setModalOpen, field, mission })}
    </>
  )
}
