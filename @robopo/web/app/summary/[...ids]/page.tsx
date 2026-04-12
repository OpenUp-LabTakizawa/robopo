import Link from "next/link"
import React from "react"
import { calcPoint } from "@/app/components/challenge/utils"
import {
  deserializeMission,
  deserializePoint,
  missionStatePair,
} from "@/app/components/course/utils"
import { HomeButton } from "@/app/components/parts/buttons"
import { getCompetitionCourseList } from "@/app/components/server/db"
import { maxCoursePoint } from "@/app/components/summary/utilServer"
import { BackLabelWithIcon } from "@/app/lib/const"
import {
  getChallengeCount,
  getCourseById,
  getCourseSummaryByPlayerId,
  getFirstCount,
  getMaxResult,
  getPlayerById,
} from "@/app/lib/db/queries/queries"
import { CourseDetailTable } from "@/app/summary/[...ids]/courseDetailTable"

export default async function SummaryPlayer({
  params,
}: {
  params: Promise<{ ids: number[] }>
}) {
  const { ids } = await params
  // ids[0]:competitionId, ids[1]:courseId (selected), ids[2]:playerId
  const competitionId = ids[0]
  const selectedCourseId = ids[1]
  const playerId = ids[2]

  const player = await getPlayerById(playerId)

  // Get all courses for this competition
  const { competitionCourses } = await getCompetitionCourseList(competitionId)

  // Selected course data
  const selectedCourse = await getCourseById(selectedCourseId)
  const selectedMissionPair = missionStatePair(
    deserializeMission(selectedCourse?.mission || ""),
  )
  const selectedPoint = deserializePoint(selectedCourse?.point || "")
  const selectedResultArray = await getCourseSummaryByPlayerId(
    competitionId,
    selectedCourseId,
    playerId,
  )
  const selectedFirstCount = await getFirstCount(
    competitionId,
    selectedCourseId,
    playerId,
  )
  const selectedMaxResult = await getMaxResult(
    competitionId,
    selectedCourseId,
    playerId,
  )

  // Calculate total score across all competition courses
  let totalPoint = 0
  for (const c of competitionCourses) {
    const maxPt = await maxCoursePoint(competitionId, playerId, c.id)
    totalPoint += maxPt
  }

  // Pre-resolve other courses data (avoid async in JSX)
  const otherCourses = competitionCourses.filter(
    (c) => c.id !== selectedCourseId,
  )
  const otherCoursesData = await Promise.all(
    otherCourses.map(async (c) => {
      const coursePoint = deserializePoint(c.point || "")
      const maxRes = await getMaxResult(competitionId, c.id, playerId)
      const maxPt =
        maxRes.length > 0 ? calcPoint(coursePoint, maxRes[0].maxResult) : null
      return { id: c.id, name: c.name, maxPt }
    }),
  )

  // Challenge count for selected course
  const challengeCount = await getChallengeCount(
    competitionId,
    selectedCourseId,
    playerId,
  )

  return (
    <>
      <div className="mb-5 flex">
        <h1 className="mt-2 mr-5 font-bold text-3xl">個人成績シート</h1>
        <h1 className="mt-2 mr-5 font-bold text-3xl text-violet-800">
          {player?.bibNumber}
        </h1>
        <h1 className="mt-2 mr-5 font-bold text-3xl text-violet-800">
          {player?.name}
        </h1>
        <h1 className="mt-2 mr-5 font-bold text-3xl text-violet-800">
          {player?.furigana}
        </h1>
        <h1 className="mt-2 mr-5 font-bold text-3xl">{player ? "選手" : ""}</h1>
      </div>

      {/* Selected course detail */}
      <div className="divider">{selectedCourse?.name}コース</div>
      <CourseDetailTable
        missionPair={selectedMissionPair}
        point={selectedPoint}
        resultArray={selectedResultArray}
        firstMaxAttemptCount={selectedFirstCount}
        maxResult={selectedMaxResult}
      />

      {/* Other courses summary */}
      {otherCoursesData.map((c) => (
        <React.Fragment key={c.id}>
          <div className="divider">{c.name}</div>
          <div className="m-5 grid justify-end">
            <table className="table-pin-rows table">
              <tbody>
                <tr>
                  <td className="border border-gray-400 bg-cyan-50 p-2 text-center">
                    MAXポイント
                  </td>
                  <td className="border border-gray-400 p-2">
                    {c.maxPt !== null ? c.maxPt : "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </React.Fragment>
      ))}

      <div className="divider">試行回数</div>
      <div className="m-5 grid justify-end">
        <table className="table-pin-rows table">
          <tbody>
            <tr>
              <td className="border border-gray-400 bg-cyan-50 p-2 text-center">
                トータル回数
              </td>
              <td className="border border-gray-400 p-2">
                {challengeCount[0]?.challengeCount ?? 0}
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
                {totalPoint}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Link
        href={`/summary?competitionId=${competitionId}`}
        className="btn btn-primary mx-auto mr-5 min-w-28 max-w-fit"
      >
        集計結果一覧へ
        <BackLabelWithIcon />
      </Link>
      <HomeButton />
    </>
  )
}
