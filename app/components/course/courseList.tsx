import type { SelectCourse } from "@/app/lib/db/schema"
import React from "react"

type CourseListProps = {
  courseData: { courses: SelectCourse[] }
  inputType: "checkbox" | "radio"
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  checkedIds: number[]
  loading: boolean
}

export const CourseList = ({ courseData, inputType, handleInputChange, checkedIds, loading }: CourseListProps) => {
  // リストの行をクリックして選択できるようにしておく。
  const handleRowClick = (courseID: number) => {
    const fakeEvent = {
      target: {
        value: courseID.toString(),
        checked: !checkedIds.includes(courseID),
      },
    } as React.ChangeEvent<HTMLInputElement>
    handleInputChange(fakeEvent)
  }

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-80 sm:max-h-96">
      <table className="table table-pin-rows">
        <thead>
          <tr>
            <th>
              <label>
                <input type={inputType} className={inputType} disabled={true} />
              </label>
            </th>
            <th>ID</th>
            <th>コース名</th>
            <th>作成日時</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="text-center">
                <span className="loading loading-spinner text-info"></span>
              </td>
            </tr>
          ) : null}
          {courseData ? (
            courseData.courses.map((courses: SelectCourse) => (
              <tr
                key={courses.id}
                className="hover cursor-pointer"
                onClick={() => handleRowClick(courses.id)}
                hidden={courses.id < 0}>
                <th>
                  <label>
                    <input
                      type={inputType}
                      className={inputType}
                      name="selectedIds"
                      value={courses.id}
                      checked={checkedIds.includes(courses.id)}
                      disabled={courses.id < 0}
                      readOnly
                    />
                  </label>
                </th>
                <td>{courses.id}</td>
                <td>{courses.name}</td>
                {/* SSRとCSRで時刻のズレでエラーが出るのでsuppressHydrationWarningする */}
                <td suppressHydrationWarning>
                  {courses.createdAt
                    ? new Date(courses.createdAt).toLocaleString("ja-JP", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <td colSpan={4}>コースはありません</td>
          )}
        </tbody>
      </table>
    </div>
  )
}
