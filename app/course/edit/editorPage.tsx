"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import CourseEdit from "@/app/course/edit/courseEdit"
import MissionEdit from "@/app/course/edit/missionEdit"
import { useCourseEdit } from "@/app/course/edit/courseEditContext"
import {
  deserializeField,
  deserializeMission,
  deserializePoint,
} from "@/app/components/course/utils"
import { getCourse } from "@/app/components/course/listUtils"
import { validationModal } from "@/app/components/course/modals"

export const EditorPage = (props: { params: Promise<{ courseId: number | null }> }) => {
  // Extract courseId from params for use in JSX
  const [courseId, setCourseId] = useState<number | null>(null);
  const { name, setName, field, setField, mission, setMission, point, setPoint } = useCourseEdit()
  const [modalOpen, setModalOpen] = useState(0)

  useEffect(() => {
    const fetchCourseData = async () => {
      const { courseId } = await props.params
      if (courseId) {
        setCourseId(courseId)
        const course = await getCourse(courseId)
        if (course) {
          if (course.field) { setField(deserializeField(course.field)) }
          if (course.mission) { setMission(deserializeMission(course.mission)) }
          if (course.point) { setPoint(deserializePoint(course.point)) }
          if (course.name) { setName(course.name) }
        }
      }
    }
    fetchCourseData()
  }, [props.params])

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
          <Link
            href={
              courseId ? `/course/edit/${courseId}/save/` : `/course/edit/save/`
            }
            className="btn btn-primary min-w-28 max-w-fit"
          >
            コースを保存
          </Link>
          <Link
            href={
              courseId ? `/course/edit/${courseId}/back/` : `/course/edit/back/`
            }
            className="btn btn-primary min-w-28 max-w-fit"
          >
            一覧に戻る
          </Link>
        </div>
      </div>

      {modalOpen === 3 && validationModal({ setModalOpen, field, mission })}
    </>
  )
}
