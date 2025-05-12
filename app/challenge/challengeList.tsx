"use client"

import type { SelectCourse } from "@/app/lib/db/schema"
import { CourseList } from "@/app/components/course/courseList"

type ChallengeListProps = {
  courseDataList: { selectCourses: SelectCourse[] }
  setStep: React.Dispatch<React.SetStateAction<number>>
  courseId: number | null
  setCourseId: React.Dispatch<React.SetStateAction<number | null>>
}

const ChallengeList = ({ courseDataList, setStep, courseId, setCourseId }: ChallengeListProps) => {
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCourseId(Number(event.target.value))
  }

  const handleNextButton = () => {
    setStep(1)
  }

  return (
    <>
      <div className="grid grid-cols-2 justify-items-center">
        <div className="self-center mx-4">
          <p>コースを選んでください</p>
        </div>
        <div>
          <button type="button" className="btn btn-primary" disabled={courseId === null} onClick={handleNextButton}>
            選手登録へ
          </button>
        </div>
      </div>
      <CourseList
        courseData={courseDataList}
        inputType="radio"
        handleInputChange={handleRadioChange}
        checkedIds={courseId !== null ? [courseId] : []} // selectedIdsを配列に変換する
        loading={false}
      />
    </>
  )
}

export default ChallengeList
