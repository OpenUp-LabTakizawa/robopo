import { describe, expect, test } from "bun:test"
import { eq } from "drizzle-orm"
import { RESERVED_COURSE_IDS } from "@/app/components/course/utils"
import { db } from "@/app/lib/db/db"
import { course, umpire } from "@/app/lib/db/schema"

describe("seed data", () => {
  test("reserved courses exist in database", async () => {
    const ippon = await db
      .select()
      .from(course)
      .where(eq(course.id, RESERVED_COURSE_IDS.IPPON))
      .limit(1)
    expect(ippon).toHaveLength(1)
    expect(ippon[0].name).toBe("THE IpponBashi")
    expect(ippon[0].fieldValid).toBe(true)
    expect(ippon[0].missionValid).toBe(true)

    const sensor = await db
      .select()
      .from(course)
      .where(eq(course.id, RESERVED_COURSE_IDS.SENSOR))
      .limit(1)
    expect(sensor).toHaveLength(1)
    expect(sensor[0].name).toBe("SensorCourse")
  })

  test("test umpire exists in database", async () => {
    const result = await db
      .select()
      .from(umpire)
      .where(eq(umpire.id, 1))
      .limit(1)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("TestUmpire")
  })

  test("reserved courses are hidden in list (id < 0)", () => {
    expect(RESERVED_COURSE_IDS.IPPON).toBeLessThan(0)
    expect(RESERVED_COURSE_IDS.SENSOR).toBeLessThan(0)
  })
})
