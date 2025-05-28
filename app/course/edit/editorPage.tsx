"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const [courseId, setCourseId] = useState<number | null>(null);
  const { name, setName, field, setField, mission, setMission, point, setPoint } = useCourseEdit()
  const [modalOpen, setModalOpen] = useState(0)

  useEffect(() => {
    async function fetchCourseData() {
      const params = await props.params
      const { courseId } = params
      if (courseId) {
        setCourseId(courseId)
        const course = await getCourse(courseId)
        if (course) {
          if (course.field) setField(deserializeField(course.field))
          if (course.mission) setMission(deserializeMission(course.mission))
          if (course.point) setPoint(deserializePoint(course.point))
          if (course.name) setName(course.name)
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
            href={`/course/edit/${courseId ?? ""}/save/`}
            className="btn btn-primary min-w-28 max-w-fit"
          >
            コースを保存
          </Link>
          <Link
            href={`/course/edit/${courseId ?? ""}/back/`}
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
