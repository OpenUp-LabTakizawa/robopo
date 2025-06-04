"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { type CourseSummary, isCompletedCourse } from "@/app/components/summary/utils"
import { deserializePoint, PointValue, RESERVED_COURSE_IDS } from "@/app/components/course/utils"
import { calcPoint } from "@/app/components/challenge/utils"
import { type SelectCourse } from "@/app/lib/db/schema"

type Props = {
  id: number
  courseList: { courses: SelectCourse[] }
  ipponBashiPoint: PointValue[]
}

export const SummaryTable = ({ id, courseList, ipponBashiPoint }: Props) => {
  const competitionId: number = id
  const courseData: { courses: SelectCourse[] } = courseList
  const initialCourseId = courseData.courses
    .filter((course) => course.id > 0)
    .reduce((mincourse, currentCourse) => (currentCourse.id < mincourse.id ? currentCourse : mincourse)).id

  const [pointData, setPointData] = useState<PointValue[]>([])
  const [courseId, setCourseId] = useState<number | null>(initialCourseId)
  const [courseSummary, setCourseSummary] = useState<CourseSummary[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [sortKey, setSortKey] = useState<string>("") // ソートする列名
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc") // 昇順・降順

  useEffect(() => {
    const fetchData = async () => {
      try {
        const selectedCourse = courseData.courses?.find((course) => course.id === courseId)
        if (selectedCourse) {
          const point = await deserializePoint(selectedCourse.point)
          setPointData(point)
        }

        const res = await fetch(`/api/summary/${competitionId}/${courseId}`, { cache: "no-store" })
        const data = await res.json()
        setCourseSummary(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [competitionId, courseId])

  // 並べ替え機能
  const handleSort = (key: keyof CourseSummary) => {
    const order = sortKey === key && sortOrder === "asc" ? "desc" : "asc"
    setSortKey(key)
    setSortOrder(order)
    const parseDateValue = (value: any, tCourseMaxResult: any): number => {
      if (
        !value ||
        value === "-" ||
        !isCompletedCourse(pointData, tCourseMaxResult)
      ) {
        return order === "asc" ? Infinity : -Infinity
      }
      const t = Date.parse(value as string)
      return isNaN(t) ? (order === "asc" ? Infinity : -Infinity) : t
    }

    const parseZekken = (value: any): number | string => {
      const num = Number(value)
      return !isNaN(num) ? num : typeof value === "string" ? value : ""
    }

    const parseNumberFallback = (value: any): number => {
      return typeof value === "number" ? value : value === null ? 0 : Number(value)
    }

    const sortedData = [...courseSummary].sort((a, b) => {
      const getVal = (item: CourseSummary) => {
        const value = item[key]

        switch (key) {
          case "firstTCourseTime":
            return parseDateValue(value, item["tCourseMaxResult"])
          case "playerFurigana":
            return typeof value === "string" ? value.toString() : ""
          case "playerZekken":
            return parseZekken(value)
          case "firstTCourseCount":
            if (!isCompletedCourse(pointData, item["tCourseMaxResult"])) {
              return order === "asc" ? Infinity : -Infinity
            }
            return parseNumberFallback(value)
          default:
            return parseNumberFallback(value)
        }
      }

      const aVal = getVal(a)
      const bVal = getVal(b)

      if (key === "playerFurigana" && typeof aVal === "string" && typeof bVal === "string") {
        return order === "asc" ? aVal.localeCompare(bVal, "ja")
          : bVal.localeCompare(aVal, "ja")
      } else if (aVal < bVal) {
        return order === "asc" ? -1 : 1
      } else if (aVal > bVal) {
        return order === "asc" ? 1 : -1
      } else {
        return 0
      }
    })
    setCourseSummary(sortedData)
  }

  const renderSortIcon = (key: string) => {
    if (sortKey === key) {
      return sortOrder === "asc" ? <span className="text-blue-500">▲</span> : <span className="text-red-500">▼</span> // sortOrder === "asc" ? "▲" : "▼"
    }
    return "▲"
  }

  const itemTitle = (title1: string, title2?: string, key?: keyof CourseSummary) => {
    return (
      <td className={"border border-gray-400 p-2" + (key && " cursor-pointer")} onClick={() => key && handleSort(key)}>
        <div className="flex-none 2xl:flex flex-row">
          <p>
            {title1} {(!title2 || title2 === "") && key && renderSortIcon(key)}
          </p>
          <p>
            {title2 && title2} {title2 && title2 !== "" && key && renderSortIcon(key)}
          </p>
        </div>
      </td>
    )
  }

  return (
    <div className="w-full">
      <div className="flex mb-5">
        <h1 className="text-3xl font-bold m-2">
          <span className="hidden sm:inline">成績判定シート</span>
          <span className="inline sm:hidden">
            成績判定
            <br />
            シート
          </span>
        </h1>
        <select
          className="select select-bordered m-2"
          onChange={(event) => setCourseId(Number(event.target.value))}
          value={courseId ? courseId : 0}>
          <option value={0} disabled>
            コースを選んでください
          </option>
          {courseData ? (
            courseData.courses?.map(
              (course) =>
                course.id !== RESERVED_COURSE_IDS.IPPON &&
                course.id !== RESERVED_COURSE_IDS.SENSOR && (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                )
            )
          ) : (
            <option>コースがありません</option>
          )}
        </select>
      </div>
      <div className="flex m-5 overflow-x-auto overflow-y-auto 2xl:overflow-x-visible max-h-96">
        <table className="table table-pin-rows table-pin-cols">
          <thead>
            <tr>
              <th className="border border-gray-400 p-2">名前</th>
              {itemTitle("ふりがな", "", "playerFurigana")}
              {itemTitle("ゼッケン", "", "playerZekken")}
              {itemTitle("ベーシックコース", "完走時刻", "firstTCourseTime")}
              {itemTitle("完走は何回", "で達成?", "firstTCourseCount")}
              {itemTitle("ベーシックコース", "の最高得点", "tCourseMaxResult")}
              {itemTitle("センサーコースの", "最高得点", "sensorMaxResult")}
              {itemTitle("一本橋の", "合計得点", "sumIpponPoint")}
              {itemTitle("一本橋の", "最高得点", "ipponMaxResult")}
              {itemTitle("全てのチャレンジ", "の総得点", "totalPoint")}
              {itemTitle("総得点", "の順位", "pointRank")}
              {itemTitle("チャレンジ", "回数", "challengeCount")}
              {itemTitle("回数の", "順位", "challengeRank")}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center">
                  <span className="loading loading-spinner text-info"></span>
                </td>
              </tr>
            ) : courseSummary.length > 0 ? (
              courseSummary?.map((player) => (
                <tr key={player.playerId}>
                  {/* 名前 */}
                  <th className="border border-gray-400 p-2">
                    <Link
                      href={`/summary/${competitionId}/${courseId}/${player.playerId}`}
                      className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600 sm:whitespace-nowrap">
                      {player.playerName ? player.playerName : "-"}
                    </Link>
                  </th>
                  {/* ふりがな */}
                  <td className="border border-gray-400 p-2 sm:whitespace-nowrap">
                    {player.playerFurigana ? player.playerFurigana : "-"}
                  </td>
                  {/* ゼッケン */}
                  <td className="border border-gray-400 p-2">{player.playerZekken ? player.playerZekken : "-"}</td>
                  {/* ベーシックコース完走時刻 */}
                  <td className="border border-gray-400 p-2">
                    {isCompletedCourse(pointData, player.tCourseMaxResult) ? player.firstTCourseTime : "-"}
                  </td>
                  {/* 完走は何回で達成? */}
                  <td className="border border-gray-400 p-2">
                    {isCompletedCourse(pointData, player.tCourseMaxResult) && player.firstTCourseCount
                      ? player.firstTCourseCount
                      : "-"}
                  </td>
                  {/* センサーコース以外 */}
                  {courseId !== RESERVED_COURSE_IDS.SENSOR && (
                    // ベーシックコースの最高得点
                    <td className="border border-gray-400 p-2">
                      {player.tCourseMaxResult || player.tCourseMaxResult === 0 ? calcPoint(pointData, player.tCourseMaxResult) : "-"}
                    </td>
                  )}
                  {/* センサーコースはmaxResultにそのまま最高得点が入ってる */}
                  {courseId === RESERVED_COURSE_IDS.SENSOR && (
                    <td className="border border-gray-400 p-2">
                      {player.sensorMaxResult ? player.sensorMaxResult : "-"}
                    </td>
                  )}
                  {/* センサーコースの最高得点 */}
                  <td className="border border-gray-400 p-2">
                    {player.sensorMaxResult ? player.sensorMaxResult : "-"}
                  </td>
                  {/* 一本橋の合計得点 */}
                  <td className="border border-gray-400 p-2">{player.sumIpponPoint ? player.sumIpponPoint : "-"}</td>
                  {/* 一本橋の最高得点 */}
                  <td className="border border-gray-400 p-2">
                    {player.ipponMaxResult || player.ipponMaxResult === 0 ? calcPoint(ipponBashiPoint, player.ipponMaxResult) : "-"}
                  </td>
                  {/* 全てのチャレンジの総得点 */}
                  <td className="border border-gray-400 p-2">{player.totalPoint ? player.totalPoint : "-"}</td>
                  {/* 総得点の順位 */}
                  <td className="border border-gray-400 p-2">{player.pointRank}</td>
                  {/* チャレンジ回数 */}
                  <td className="border border-gray-400 p-2">{player.challengeCount}</td>
                  {/* 回数の順位 */}
                  <td className="border border-gray-400 p-2">{player.challengeRank}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="border border-gray-400 p-2 text-center">
                  データがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
