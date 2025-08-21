"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { validationModal } from "@/app/components/course/modals"
import {
  deserializeField,
  deserializeMission,
  deserializePoint,
} from "@/app/components/course/utils"
import CourseEdit from "@/app/course/edit/courseEdit"
import { useCourseEdit } from "@/app/course/edit/courseEditContext"
import MissionEdit from "@/app/course/edit/missionEdit"
import { BackLabelWithIcon } from "@/app/lib/const"
import type { SelectCourse } from "@/app/lib/db/schema"

export function EditorPage({
  courseData,
}: {
  courseData: SelectCourse | null
}) {
  const courseId = courseData?.id || null

  const { setName, field, setField, mission, setMission, point, setPoint } =
    useCourseEdit()
  const [modalOpen, setModalOpen] = useState(0)

  useEffect(() => {
    async function fetchCourseData() {
      if (courseData) {
        if (courseData.field) {
          setField(deserializeField(courseData.field))
        }
        if (courseData.mission) {
          setMission(deserializeMission(courseData.mission))
        }
        if (courseData.point) {
          setPoint(deserializePoint(courseData.point))
        }
        if (courseData.name) {
          setName(courseData.name)
        }
      }
    }
    fetchCourseData()
  }, [courseData, setField, setMission, setPoint, setName])

  return (
    <>
      <div className="h-full w-full">
        <div className="gap-4 sm:grid sm:max-h-screen sm:grid-cols-2">
          <div className="sm:w-full sm:justify-self-end">
            <CourseEdit field={field} setField={setField} />
          </div>
          <div className="sm:mx-4 sm:w-full sm:justify-self-start">
            <MissionEdit
              mission={mission}
              setMission={setMission}
              point={point}
              setPoint={setPoint}
            />
          </div>
        </div>
        <div className="mt-0 flex justify-center gap-4 p-4">
          <button
            type="button"
            className="btn btn-primary min-w-28 max-w-fit"
            onClick={() => setModalOpen(3)}
          >
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
            一覧に
            <BackLabelWithIcon />
          </Link>
        </div>
      </div>

      {modalOpen === 3 && validationModal({ setModalOpen, field, mission })}
    </>
  )
}
