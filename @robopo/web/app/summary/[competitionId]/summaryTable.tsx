"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { calcPoint } from "@/app/components/challenge/utils"
import {
  deserializePoint,
  type PointState,
  type PointValue,
  RESERVED_COURSE_IDS,
} from "@/app/components/course/utils"
import {
  type CourseSummary,
  isCompletedCourse,
} from "@/app/components/summary/utils"
import type { SelectCourse } from "@/app/lib/db/schema"

type Props = {
  id: number
  courseList: { courses: SelectCourse[] }
  ipponBashiPoint: PointValue[]
}

export function SummaryTable({ id, courseList, ipponBashiPoint }: Props) {
  const competitionId: number = id
  const courseData: { courses: SelectCourse[] } = courseList
  const initialCourseId = courseData.courses
    .filter((course) => course.id > 0)
    .reduce((mincourse, currentCourse) =>
      currentCourse.id < mincourse.id ? currentCourse : mincourse,
    ).id

  const [pointData, setPointData] = useState<PointValue[]>([])
  const [courseId, setCourseId] = useState<number | null>(initialCourseId)
  const [courseSummary, setCourseSummary] = useState<CourseSummary[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [sortKey, setSortKey] = useState<string>("") // ソートする列名
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc") // 昇順・降順

  useEffect(() => {
    async function fetchData() {
      try {
        const selectedCourse = courseData.courses?.find(
          (course) => course.id === courseId,
        )
        if (selectedCourse) {
          const point = await deserializePoint(selectedCourse.point)
          setPointData(point)
        }

        const res = await fetch(`/api/summary/${competitionId}/${courseId}`, {
          cache: "no-store",
        })
        const data = await res.json()
        setCourseSummary(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [competitionId, courseData, courseId])

  // 並べ替え機能
  function handleSort(key: keyof CourseSummary) {
    const order = sortKey === key && sortOrder === "asc" ? "desc" : "asc"
    setSortKey(key)
    setSortOrder(order)
    function parseDateValue(value: any, tCourseMaxResult: any): number {
      if (
        !value ||
        value === "-" ||
        !isCompletedCourse(pointData, tCourseMaxResult)
      ) {
        return order === "asc" ? Infinity : -Infinity
      }
      const t = Date.parse(value as string)
      return Number.isNaN(t) ? (order === "asc" ? Infinity : -Infinity) : t
    }

    const parseZekken = (value: any): number | string => {
      const num = Number(value)
      return !Number.isNaN(num) ? num : typeof value === "string" ? value : ""
    }

    const parseNumberFallback = (value: any): number => {
      if (typeof value === "number") {
        return value
      }
      if (value === null) {
        return 0
      }
      const num = Number(value)
      return Number.isNaN(num) ? 0 : num
    }

    const sortedData = [...courseSummary].sort((a, b) => {
      function getVal(item: CourseSummary) {
        const value = item[key]

        switch (key) {
          case "firstTCourseTime":
            return parseDateValue(value, item.tCourseMaxResult)
          case "playerFurigana":
            return typeof value === "string" ? value.toString() : ""
          case "playerZekken":
            return parseZekken(value)
          case "firstTCourseCount":
            if (!isCompletedCourse(pointData, item.tCourseMaxResult)) {
              return order === "asc" ? Infinity : -Infinity
            }
            return parseNumberFallback(value)
          default:
            return parseNumberFallback(value)
        }
      }

      const aVal = getVal(a)
      const bVal = getVal(b)

      if (
        key === "playerFurigana" &&
        typeof aVal === "string" &&
        typeof bVal === "string"
      ) {
        return order === "asc"
          ? aVal.localeCompare(bVal, "ja")
          : bVal.localeCompare(aVal, "ja")
      }
      if (aVal < bVal) {
        return order === "asc" ? -1 : 1
      }
      if (aVal > bVal) {
        return order === "asc" ? 1 : -1
      }
      return 0
    })
    setCourseSummary(sortedData)
  }

  function renderSortIcon(key: string) {
    if (sortKey === key) {
      return sortOrder === "asc" ? (
        <span className="text-blue-500">▲</span>
      ) : (
        <span className="text-red-500">▼</span>
      ) // sortOrder === "asc" ? "▲" : "▼"
    }
    return "▲"
  }

  function itemTitle(
    title1: string,
    title2?: string,
    key?: keyof CourseSummary,
  ) {
    return (
      <td
        className={`border border-gray-400 p-2 ${key ? "cursor-pointer" : ""}}`}
        onClick={() => key && handleSort(key)}
      >
        <div className="flex-none flex-row 2xl:flex">
          <p>
            {title1} {(!title2 || title2 === "") && key && renderSortIcon(key)}
          </p>
          <p>
            {title2} {title2 !== "" && key && renderSortIcon(key)}
          </p>
        </div>
      </td>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-5 flex">
        <h1 className="m-2 font-bold text-3xl">
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
          value={courseId ? courseId : 0}
        >
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
                ),
            )
          ) : (
            <option>コースがありません</option>
          )}
        </select>
      </div>
      <div className="m-5 flex max-h-96 overflow-x-auto overflow-y-auto 2xl:overflow-x-visible">
        <table className="table-pin-rows table-pin-cols table">
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
                <PlayerRow
                  key={player.playerId}
                  player={player}
                  competitionId={Number(competitionId)}
                  courseId={Number(courseId)}
                  pointData={pointData}
                  ipponBashiPoint={ipponBashiPoint}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="border border-gray-400 p-2 text-center"
                >
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

type PlayerRowProps = {
  player: CourseSummary
  competitionId: number
  courseId: number
  pointData: PointState
  ipponBashiPoint: PointValue[]
}

function PlayerRow({
  player,
  competitionId,
  courseId,
  pointData,
  ipponBashiPoint,
}: PlayerRowProps) {
  const completed = isCompletedCourse(pointData, player.tCourseMaxResult)
  return (
    <tr>
      {/* 名前 */}
      <th className="border border-gray-400 p-2">
        <Link
          href={`/summary/${competitionId}/${courseId}/${player.playerId}`}
          className="text-blue-600 underline visited:text-purple-600 hover:text-blue-800 sm:whitespace-nowrap"
        >
          {player.playerName ?? "-"}
        </Link>
      </th>
      {/* ふりがな */}
      <td className="border border-gray-400 p-2 sm:whitespace-nowrap">
        {player.playerFurigana ?? "-"}
      </td>
      {/* ゼッケン */}
      <td className="border border-gray-400 p-2">
        {player.playerZekken ?? "-"}
      </td>
      {/* ベーシックコース完走時刻 */}
      <td className="border border-gray-400 p-2">
        {completed ? player.firstTCourseTime : "-"}
      </td>
      {/* 完走は何回で達成? */}
      <td className="border border-gray-400 p-2">
        {completed && player.firstTCourseCount ? player.firstTCourseCount : "-"}
      </td>
      {/* ベーシックコースの最高得点 */}
      <td className="border border-gray-400 p-2">
        {player.tCourseMaxResult || player.tCourseMaxResult === 0
          ? calcPoint(pointData, player.tCourseMaxResult)
          : "-"}
      </td>
      {/* センサーコースの最高得点 */}
      <td className="border border-gray-400 p-2">
        {player.sensorMaxResult ?? "-"}
      </td>
      {/* 一本橋の合計得点 */}
      <td className="border border-gray-400 p-2">
        {player.sumIpponPoint ?? "-"}
      </td>
      {/* 一本橋の最高得点 */}
      <td className="border border-gray-400 p-2">
        {player.ipponMaxResult || player.ipponMaxResult === 0
          ? calcPoint(ipponBashiPoint, player.ipponMaxResult)
          : "-"}
      </td>
      {/* 全てのチャレンジの総得点 */}
      <td className="border border-gray-400 p-2">{player.totalPoint ?? "-"}</td>
      {/* 総得点の順位 */}
      <td className="border border-gray-400 p-2">{player.pointRank}</td>
      {/* チャレンジ回数 */}
      <td className="border border-gray-400 p-2">{player.challengeCount}</td>
      {/* 回数の順位 */}
      <td className="border border-gray-400 p-2">{player.challengeRank}</td>
    </tr>
  )
}
