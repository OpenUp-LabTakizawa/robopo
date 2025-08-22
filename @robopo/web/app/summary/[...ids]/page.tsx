import Link from "next/link"
import React from "react"
import { calcPoint } from "@/app/components/challenge/utils"
import {
  deserializeMission,
  deserializePoint,
  missionStatePair,
  RESERVED_COURSE_IDS,
} from "@/app/components/course/utils"
import { HomeButton } from "@/app/components/parts/buttons"
import { sumIpponPoint } from "@/app/components/summary/utilServer"
import { isCompletedCourse } from "@/app/components/summary/utils"
import { BackLabelWithIcon } from "@/app/lib/const"
import {
  getChallengeCount,
  getCourseById,
  getCourseSummaryByPlayerId,
  getFirstCount,
  getMaxResult,
  getPlayerById,
} from "@/app/lib/db/queries/queries"
import { TCourseTable } from "@/app/summary/[...ids]/tCourseTable"

export const revalidate = 0

export default async function SummaryPlayer({
  params,
}: {
  params: Promise<{ ids: number[] }>
}) {
  const { ids } = await params
  // ids[0]:competitionId, ids[1]:courseId, ids[2]:playerId
  // 個人成績を取得する
  const player = await getPlayerById(ids[2])

  const resultArray = await getCourseSummaryByPlayerId(ids[0], ids[1], ids[2])
  const firstTCourseCount = await getFirstCount(ids[0], ids[1], ids[2])
  const maxResult: { maxResult: number }[] = await getMaxResult(
    ids[0],
    ids[1],
    ids[2],
  )

  const resultIpponArray = await getCourseSummaryByPlayerId(
    ids[0],
    RESERVED_COURSE_IDS.IPPON,
    ids[2],
  )
  const firstIpponCount = await getFirstCount(
    ids[0],
    RESERVED_COURSE_IDS.IPPON,
    ids[2],
  )
  const maxIpponResult: { maxResult: number }[] = await getMaxResult(
    ids[0],
    RESERVED_COURSE_IDS.IPPON,
    ids[2],
  )

  const resultSensorArray = await getCourseSummaryByPlayerId(
    ids[0],
    RESERVED_COURSE_IDS.SENSOR,
    ids[2],
  )
  const maxSensorResult: { maxResult: number }[] = await getMaxResult(
    ids[0],
    RESERVED_COURSE_IDS.SENSOR,
    ids[2],
  )

  const challengeCount = await getChallengeCount(ids[0], ids[1], ids[2])

  // コースデータを取得する
  const course = await getCourseById(ids[1])
  const missionPair = missionStatePair(
    deserializeMission(course?.mission || ""),
  )
  const point = deserializePoint(course?.point || "")

  // 一本橋のデータを取得する
  const ipponBashi = await getCourseById(RESERVED_COURSE_IDS.IPPON)
  const ipponPoint = deserializePoint(ipponBashi?.point || "")

  // 一本橋コースで得た総得点
  const sumIpponPoints = await sumIpponPoint(ids[0], ids[2])

  return (
    <>
      <div className="mb-5 flex">
        <h1 className="mt-2 mr-5 font-bold text-3xl">個人成績シート</h1>
        <h1 className="mt-2 mr-5 font-bold text-3xl text-violet-800">
          {player?.zekken}
        </h1>
        <h1 className="mt-2 mr-5 font-bold text-3xl text-violet-800">
          {player?.name}
        </h1>
        <h1 className="mt-2 mr-5 font-bold text-3xl text-violet-800">
          {player?.furigana}
        </h1>
        <h1 className="mt-2 mr-5 font-bold text-3xl">{player ? "選手" : ""}</h1>
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
      <div className="grid w-full justify-center">
        <table>
          <tbody>
            <tr className="grid grid-cols-5 justify-center text-base sm:grid-cols-10 lg:grid-cols-20">
              {resultIpponArray.map((result, index: number) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: resultIpponArrayの要素にidが無いのでindexをキーにする
                <React.Fragment key={index}>
                  <td className="min-w-9 border border-gray-400 p-2 text-center">
                    {calcPoint(ipponPoint, result.results1)}
                  </td>
                  {result.results2 !== null && (
                    <td className="min-w-9 border border-gray-400 p-2 text-center">
                      {calcPoint(ipponPoint, result.results2)}
                    </td>
                  )}
                </React.Fragment>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="m-5 grid justify-end">
        <table className="table-pin-rows table">
          <tbody>
            <tr>
              <td className="border border-gray-400 bg-cyan-50 p-2 text-center">
                一本橋の合計得点
              </td>
              <td className="border border-gray-400 p-2">
                {maxIpponResult.length > 0 ? sumIpponPoints : "-"}
              </td>
              <td className="border border-gray-400 bg-cyan-50 p-2 text-center">
                成功までの回数
              </td>
              <td className="border border-gray-400 p-2">
                {maxIpponResult.length > 0 &&
                isCompletedCourse(ipponPoint, maxIpponResult[0].maxResult)
                  ? firstIpponCount[0].firstCount
                  : "-"}
              </td>
              <td className="border border-gray-400 bg-cyan-50 p-2 text-center">
                MAXポイント
              </td>
              <td className="border border-gray-400 p-2">
                {maxIpponResult.length > 0
                  ? calcPoint(ipponPoint, maxIpponResult[0].maxResult)
                  : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="divider">センサーコース</div>
      <div className="grid w-full justify-center">
        <table>
          <tbody>
            <tr className="grid grid-cols-5 justify-center text-base sm:grid-cols-10 lg:grid-cols-20">
              {resultSensorArray.map((result, index: number) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: resultIpponArrayの要素にidが無いのでindexをキーにする
                <React.Fragment key={index}>
                  <td className="min-w-9 border border-gray-400 p-2 text-center">
                    {result.results1}
                  </td>
                  {result.results2 !== null && (
                    <td className="min-w-9 border border-gray-400 p-2 text-center">
                      {result.results2}
                    </td>
                  )}
                </React.Fragment>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="m-5 grid justify-end">
        <table className="table-pin-rows table">
          <tbody>
            <tr>
              <td className="border border-gray-400 bg-cyan-50 p-2 text-center">
                MAXポイント
              </td>
              <td className="border border-gray-400 p-2">
                {maxSensorResult.length > 0
                  ? maxSensorResult[0].maxResult
                  : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="divider">試行回数</div>
      <div className="m-5 grid justify-end">
        <table className="table-pin-rows table">
          <tbody>
            <tr>
              <td className="border border-gray-400 bg-cyan-50 p-2 text-center">
                トータル回数
              </td>
              <td className="border border-gray-400 p-2">
                {challengeCount[0].challengeCount}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="m-5 grid justify-end">
        <table className="table-pin-rows table">
          <tbody>
            <tr>
              <td className="border border-gray-400 bg-cyan-50 p-2 text-center text-2xl">
                トータルポイント
              </td>
              <td className="border border-gray-400 p-2 text-2xl">
                {(maxResult.length > 0
                  ? calcPoint(point, maxResult[0].maxResult)
                  : 0) +
                  (maxIpponResult.length > 0
                    ? calcPoint(ipponPoint, maxIpponResult[0].maxResult)
                    : 0) +
                  (maxSensorResult.length > 0
                    ? maxSensorResult[0].maxResult
                    : 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Link
        href={`/summary/${ids[0]}`}
        className="btn btn-primary mx-auto mr-5 min-w-28 max-w-fit"
      >
        集計結果一覧へ
        <BackLabelWithIcon />
      </Link>
      <HomeButton />
    </>
  )
}
