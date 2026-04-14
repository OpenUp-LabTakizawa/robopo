import { describe, expect, test } from "bun:test"
import { eq } from "drizzle-orm"
import { deserializeField } from "@/app/lib/course/field"
import { deserializeMission } from "@/app/lib/course/mission"
import { checkValidity } from "@/app/lib/course/validation"
import { db } from "@/app/lib/db/db"
import { course, judge, user } from "@/app/lib/db/schema"

describe("seed data", () => {
  test("test judge exists in database", async () => {
    const result = await db
      .select({ id: judge.id, username: user.username })
      .from(judge)
      .innerJoin(user, eq(judge.userId, user.id))
      .where(eq(user.username, "testjudge"))
      .limit(1)
    expect(result).toHaveLength(1)
    expect(result[0].username).toBe("testjudge")
  })

  for (const courseName of ["TestCourse", "TestCourse2"]) {
    test(`${courseName} passes checkValidity`, async () => {
      const rows = await db
        .select()
        .from(course)
        .where(eq(course.name, courseName))
        .limit(1)
      expect(rows).toHaveLength(1)
      expect(rows[0].fieldValid).toBe(true)
      expect(rows[0].missionValid).toBe(true)
      const field = deserializeField(rows[0].field ?? "")
      const mission = deserializeMission(rows[0].mission ?? "")
      expect(checkValidity(field, mission)).toBe(true)
    })
  }
})
