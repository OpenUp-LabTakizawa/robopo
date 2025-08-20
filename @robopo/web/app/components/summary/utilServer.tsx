import { calcPoint } from "@/app/components/challenge/utils"
import {
  deserializePoint,
  RESERVED_COURSE_IDS,
} from "@/app/components/course/utils"
import {
  getCourseById,
  getCourseSummaryByPlayerId,
} from "@/app/lib/db/queries/queries"

// THE 一本橋コースの総得点を計算する
export async function sumIpponPoint(
  compeId: number,
  playerId: number,
): Promise<number> {
  const resultIpponArray = await getCourseSummaryByPlayerId(
    compeId,
    RESERVED_COURSE_IDS.IPPON,
    playerId,
  )
  const course = await getCourseById(RESERVED_COURSE_IDS.IPPON)
  const pointState = deserializePoint(course?.point || "")

  const sum = resultIpponArray.reduce((sum, result) => {
    let temp: number = calcPoint(pointState, result.results1)
    if (result.results2 !== null) {
      temp += calcPoint(pointState, result.results2)
    }
    return sum + temp
  }, 0)

  return sum
}
