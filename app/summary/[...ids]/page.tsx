import React from "react"
import Link from "next/link"
import {
  getCourseById,
  getCourseSummaryByPlayerId,
  getMaxResult,
  getFirstCount,
  getPlayerById,
  getChallengeCount,
} from "@/app/lib/db/queries/queries"
import { deserializeMission, deserializePoint, missionStatePair, RESERVED_COURSE_IDS } from "@/app/components/course/utils"
import { isCompletedCourse } from "@/app/components/summary/utils"
import { sumIpponPoint } from "@/app/components/summary/utilServer"
import { calcPoint } from "@/app/components/challenge/utils"
import { TCourseTable } from "@/app/summary/[...ids]/tCourseTable"
import { HomeButton } from "@/app/components/parts/buttons"
import { BackLabelWithIcon } from "@/app/lib/const"

export const revalidate = 0

export default async function SummaryPlayer(props: { params: Promise<{ ids: number[] }> }) {
  const { ids } = await props.params
  // ids[0]:competitionId, ids[1]:courseId, ids[2]:playerId
  // 個人成績を取得する
  const player = await getPlayerById(ids[2])

  const resultArray = await getCourseSummaryByPlayerId(ids[0], ids[1], ids[2])
  const firstTCourseCount = await getFirstCount(ids[0], ids[1], ids[2])
  const maxResult: { maxResult: number }[] = await getMaxResult(ids[0], ids[1], ids[2])

  const resultIpponArray = await getCourseSummaryByPlayerId(ids[0], RESERVED_COURSE_IDS.IPPON, ids[2])
  const firstIpponCount = await getFirstCount(ids[0], RESERVED_COURSE_IDS.IPPON, ids[2])
  const maxIpponResult: { maxResult: number }[] = await getMaxResult(ids[0], RESERVED_COURSE_IDS.IPPON, ids[2])

  const resultSensorArray = await getCourseSummaryByPlayerId(ids[0], RESERVED_COURSE_IDS.SENSOR, ids[2])
  const maxSensorResult: { maxResult: number }[] = await getMaxResult(ids[0], RESERVED_COURSE_IDS.SENSOR, ids[2])

  const challengeCount = await getChallengeCount(ids[0], ids[1], ids[2])

  // コースデータを取得する
  const course = await getCourseById(ids[1])
  const missionPair = missionStatePair(deserializeMission(course?.mission || ""))
  const point = deserializePoint(course?.point || "")

  // 一本橋のデータを取得する
  const ipponBashi = await getCourseById(RESERVED_COURSE_IDS.IPPON)
  const ipponPoint = deserializePoint(ipponBashi?.point || "")

  // 一本橋コースで得た総得点
  const sumIpponPoints = await sumIpponPoint(ids[0], ids[2])

  return (
    <>
      <div className="flex mb-5">
        <h1 className="text-3xl font-bold mr-5 mt-2">個人成績シート</h1>
        <h1 className="text-3xl text-violet-800 font-bold mr-5 mt-2">{player?.zekken}</h1>
        <h1 className="text-3xl text-violet-800 font-bold mr-5 mt-2">{player?.name}</h1>
        <h1 className="text-3xl text-violet-800 font-bold mr-5 mt-2">{player?.furigana}</h1>
        <h1 className="text-3xl font-bold mr-5 mt-2">{player ? "選手" : ""}</h1>
      </div>
      <div className="divider">{course?.name}コース</div>

      <TCourseTable
        missionPair={missionPair}
        point={point}
        resultArray={resultArray}
        firstTCourseCount={firstTCourseCount}
        maxResult={maxResult}
      />

      <div className="divider">THE一本橋</div>
      <div className="grid justify-center w-full">
        <table>
          <tbody>
            <tr className="grid justify-center text-base grid-cols-5 sm:grid-cols-10 lg:grid-cols-20">
              {resultIpponArray.map((result, index: number) => (
                <React.Fragment key={index}>
                  <td className="border border-gray-400 min-w-9 p-2 text-center">
                    {calcPoint(ipponPoint, result.results1)}
                  </td>
                  {result.results2 !== null && (
                    <td className="border border-gray-400 min-w-9 p-2 text-center">
                      {calcPoint(ipponPoint, result.results2)}
                    </td>
                  )}
                </React.Fragment>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="grid justify-end m-5">
        <table className="table table-pin-rows">
          <tbody>
            <tr>
              <td className="border bg-cyan-50 border-gray-400 p-2 text-center">一本橋の合計得点</td>
              <td className="border border-gray-400 p-2">{maxIpponResult.length > 0 ? sumIpponPoints : "-"}</td>
              <td className="border bg-cyan-50 border-gray-400 p-2 text-center">成功までの回数</td>
              <td className="border border-gray-400 p-2">
                {maxIpponResult.length > 0 && isCompletedCourse(ipponPoint, maxIpponResult[0].maxResult)
                  ? firstIpponCount[0].firstCount
                  : "-"}
              </td>
              <td className="border bg-cyan-50 border-gray-400 p-2 text-center">MAXポイント</td>
              <td className="border border-gray-400 p-2">
                {maxIpponResult.length > 0 ? calcPoint(ipponPoint, maxIpponResult[0].maxResult) : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="divider">センサーコース</div>
      <div className="grid justify-center w-full">
        <table>
          <tbody>
            <tr className="grid justify-center text-base grid-cols-5 sm:grid-cols-10 lg:grid-cols-20">
              {resultSensorArray.map((result, index: number) => (
                <React.Fragment key={index}>
                  <td className="border border-gray-400 min-w-9 p-2 text-center">{result.results1}</td>
                  {result.results2 !== null && (
                    <td className="border border-gray-400 min-w-9 p-2 text-center">{result.results2}</td>
                  )}
                </React.Fragment>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="grid justify-end m-5">
        <table className="table table-pin-rows">
          <tbody>
            <tr>
              <td className="border bg-cyan-50 border-gray-400 p-2 text-center">MAXポイント</td>
              <td className="border border-gray-400 p-2">
                {maxSensorResult.length > 0 ? maxSensorResult[0].maxResult : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="divider">試行回数</div>
      <div className="grid justify-end m-5">
        <table className="table table-pin-rows">
          <tbody>
            <tr>
              <td className="border bg-cyan-50 border-gray-400 p-2 text-center">トータル回数</td>
              <td className="border border-gray-400 p-2">{challengeCount[0].challengeCount}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid justify-end m-5">
        <table className="table table-pin-rows">
          <tbody>
            <tr>
              <td className="border bg-cyan-50 border-gray-400 p-2 text-center text-2xl">トータルポイント</td>
              <td className="border border-gray-400 p-2 text-2xl">
                {(maxResult.length > 0 ? calcPoint(point, maxResult[0].maxResult) : 0) +
                  (maxIpponResult.length > 0 ? calcPoint(ipponPoint, maxIpponResult[0].maxResult) : 0) +
                  (maxSensorResult.length > 0 ? maxSensorResult[0].maxResult : 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Link href={`/summary/` + ids[0]} className="btn btn-primary min-w-28 max-w-fit mx-auto mr-5">
        集計結果一覧へ<BackLabelWithIcon />
      </Link>
      <HomeButton />
    </>
  )
}
