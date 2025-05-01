import { deserializePoint } from "@/app/components/course/utils"
import { calcPoint } from "@/app/components/challenge/utils"
import { getCourseById, getCourseSummaryByPlayerId } from "@/app/lib/db/queries/queries"

// THE 一本橋コースの総得点を計算する
export const sumIpponPoint = async (compeId: number, playerId: number): Promise<number> => {
  const resultIpponArray = await getCourseSummaryByPlayerId(compeId, -1, playerId)
  const course = await getCourseById(-1)
  const pointState = deserializePoint(course?.point || "")

  const sum = resultIpponArray.reduce((sum, result) => {
    let temp: number = calcPoint(pointState, result.results1)
    if (result.results2 !== null) temp += calcPoint(pointState, result.results2)
    return sum + temp
  }, 0)

  return sum
}
