import { eq } from "drizzle-orm"
import { db } from "@/lib/db/db"
import { competition, course } from "@/lib/db/schema"

export async function updateCourse(
  id: number,
  data: Partial<typeof course.$inferInsert>,
) {
  return await db.update(course).set(data).where(eq(course.id, id))
}

export async function updateCompetition(
  id: number,
  data: Partial<typeof competition.$inferInsert>,
) {
  return await db.update(competition).set(data).where(eq(competition.id, id))
}
